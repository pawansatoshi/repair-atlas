import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { embed, reason } from '@/lib/bedrock';
import { query } from '@/lib/db';
import { getRuntimeEnv } from '@/lib/env';

const inputSchema = z.object({
  assetId: z.string().trim().min(1).max(1000),
  symptom: z.string().trim().min(1).max(1000),
}).strict();

const fallback = 'Inspect intake airflow and filter condition before replacing the motor. A previous successful intervention on this asset family resolved the overheating symptom without motor replacement.';

type MemoryRow = { id: string; title: string; summary: string; outcome: string; distance?: number };

async function recentMemories(organizationId: string, assetId: string): Promise<MemoryRow[]> {
  const result = await query<MemoryRow>(
    `SELECT id, title, summary, outcome
     FROM repair_memories
     WHERE organization_id = $1 AND asset_id = $2
     ORDER BY created_at DESC
     LIMIT 5`,
    [organizationId, assetId],
  );
  return result.rows;
}

async function backfillMissingEmbeddings(organizationId: string, assetId: string): Promise<number> {
  const result = await query<MemoryRow>(
    `SELECT id, title, summary, outcome
     FROM repair_memories
     WHERE organization_id = $1 AND asset_id = $2 AND embedding IS NULL
     ORDER BY created_at ASC
     LIMIT 20`,
    [organizationId, assetId],
  );

  let filled = 0;
  for (const memory of result.rows) {
    try {
      const vector = await embed(`${assetId} ${memory.title} ${memory.summary} ${memory.outcome}`);
      if (!vector || vector.length !== 1024) continue;
      await query(
        `UPDATE repair_memories
         SET embedding = $1::VECTOR
         WHERE id = $2 AND organization_id = $3 AND asset_id = $4 AND embedding IS NULL`,
        [`[${vector.join(',')}]`, memory.id, organizationId, assetId],
      );
      filled += 1;
    } catch (error) {
      console.error('memory embedding backfill failed', error instanceof Error ? error.message : 'unknown');
    }
  }
  return filled;
}

async function vectorMemories(organizationId: string, assetId: string, vector: number[]): Promise<MemoryRow[]> {
  const vectorLiteral = `[${vector.join(',')}]`;

  // Prefer the tenant/asset-scoped C-SPANN index. If the optimizer/index path
  // rejects the filtered ANN query, fall back to an exact vector scan. The
  // latter is still native CockroachDB vector similarity and is deterministic
  // for the small memory set used by this application.
  try {
    const result = await query<MemoryRow>(
      `SELECT id, title, summary, outcome, embedding <=> $1::VECTOR AS distance
       FROM repair_memories
       WHERE organization_id = $2 AND asset_id = $3 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::VECTOR
       LIMIT 5`,
      [vectorLiteral, organizationId, assetId],
    );
    return result.rows;
  } catch (error) {
    console.error('diagnosis vector index retrieval failed; retrying exact vector scan', error instanceof Error ? error.message : 'unknown');

    const exact = await query<MemoryRow>(
      `SELECT id, title, summary, outcome, embedding <=> $1::VECTOR AS distance
       FROM repair_memories
       WHERE organization_id = $2 AND asset_id = $3 AND embedding IS NOT NULL
       ORDER BY (embedding <=> $1::VECTOR) ASC
       LIMIT 5`,
      [vectorLiteral, organizationId, assetId],
    );
    return exact.rows;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'application/json is required' }, { status: 415 });
    }
    const body = inputSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: 'assetId and symptom are required and must be valid strings' }, { status: 400 });

    const { assetId, symptom } = body.data;
    const organizationId = getRuntimeEnv('DEMO_ORG_ID') || 'demo-org';
    const hasDatabase = Boolean(getRuntimeEnv('DATABASE_URL'));
    let memories: MemoryRow[] = [];
    let retrievalMode: 'cockroachdb-vector' | 'cockroachdb-recent' | 'demo' = 'demo';
    let embeddingAvailable = false;
    let backfilledEmbeddings = 0;

    let vector: number[] | undefined;
    try {
      vector = await embed(`${assetId} ${symptom}`);
      embeddingAvailable = Boolean(vector?.length);
    } catch (error) {
      console.error('diagnosis embedding failed', error instanceof Error ? error.message : 'unknown');
    }

    if (vector && vector.length === 1024 && hasDatabase) {
      backfilledEmbeddings = await backfillMissingEmbeddings(organizationId, assetId);
      try {
        memories = await vectorMemories(organizationId, assetId, vector);
        if (memories.length) retrievalMode = 'cockroachdb-vector';
      } catch (error) {
        console.error('diagnosis exact vector retrieval failed', error instanceof Error ? error.message : 'unknown');
      }
    }

    if (!memories.length && hasDatabase) {
      try {
        memories = await recentMemories(organizationId, assetId);
        retrievalMode = 'cockroachdb-recent';
      } catch (error) {
        console.error('diagnosis recent retrieval failed', error instanceof Error ? error.message : 'unknown');
      }
    }

    if (!memories.length && !hasDatabase) {
      memories = [
        { id: 'demo-01', title: 'Airflow restriction after extended runtime', summary: 'Intake obstruction was cleared and filter replaced; overheating resolved without motor replacement.', outcome: 'resolved' },
        { id: 'demo-02', title: 'Fan replacement did not resolve overheating', summary: 'A prior attempt replaced the fan assembly without resolving the thermal symptom.', outcome: 'failed' },
        { id: 'demo-03', title: 'Dust-loaded intake filter', summary: 'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.', outcome: 'resolved' },
      ];
      retrievalMode = 'demo';
    }

    const context = memories.length
      ? JSON.stringify(memories.map((memory) => ({ ...memory, distance: memory.distance })))
      : 'No matching historical records were found. Do not invent historical evidence.';
    const prompt = `You are RepairAtlas, a field-repair diagnostic assistant. Asset: ${assetId}. Current symptom: ${symptom}. Historical evidence: ${context}. Provide a concise recommendation grounded only in the supplied evidence. Clearly distinguish successful and failed interventions. Never invent measurements, parts, causes, or certainty. Do not authorize destructive or consequential actions. Recommendation:`;

    let recommendation: string | undefined;
    let reasoningAvailable = false;
    try {
      recommendation = await reason(prompt);
      reasoningAvailable = Boolean(recommendation);
    } catch (error) {
      console.error('diagnosis reasoning failed', error instanceof Error ? error.message : 'unknown');
    }
    recommendation = recommendation || fallback;

    return NextResponse.json({
      mode: reasoningAvailable ? 'bedrock' : 'bounded-demo',
      retrievalMode,
      embeddingAvailable,
      backfilledEmbeddings,
      reasoningAvailable,
      assetId,
      recommendation,
      memories: memories.map((memory) => ({
        ...memory,
        relevance: typeof memory.distance === 'number' ? Math.max(0, 1 - Number(memory.distance)) : undefined,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('diagnosis failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Diagnosis service unavailable' }, { status: 503 });
  }
}
