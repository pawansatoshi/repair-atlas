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

    let vector: number[] | undefined;
    try {
      vector = await embed(`${assetId} ${symptom}`);
      embeddingAvailable = Boolean(vector?.length);
    } catch (error) {
      console.error('diagnosis embedding failed', error instanceof Error ? error.message : 'unknown');
    }

    if (vector && hasDatabase) {
      try {
        const vectorLiteral = `[${vector.join(',')}]`;
        const result = await query<MemoryRow>(
          `SELECT id, title, summary, outcome, embedding <=> $1::VECTOR AS distance
           FROM repair_memories
           WHERE organization_id = $2 AND asset_id = $3 AND embedding IS NOT NULL
           ORDER BY embedding <=> $1::VECTOR
           LIMIT 5`,
          [vectorLiteral, organizationId, assetId],
        );
        memories = result.rows;
        retrievalMode = 'cockroachdb-vector';
      } catch (error) {
        console.error('diagnosis vector retrieval failed', error instanceof Error ? error.message : 'unknown');
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
