import { NextRequest, NextResponse } from 'next/server';
import { embed, reason } from '@/lib/bedrock';
import { query } from '@/lib/db';

const fallback = 'Inspect intake airflow and filter condition before replacing the motor. A previous successful intervention on this asset family resolved the overheating symptom without motor replacement.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptom = typeof body?.symptom === 'string' ? body.symptom.trim().slice(0,1000) : '';
    const assetId = typeof body?.assetId === 'string' ? body.assetId.trim().slice(0,100) : '';
    if (!symptom || !assetId) return NextResponse.json({error:'assetId and symptom are required'}, {status:400});
    const vector = await embed(`${assetId} ${symptom}`);
    let memories: unknown[] = [];
    if (vector && process.env.DATABASE_URL) {
      const v = `[${vector.join(',')}]`;
      const result = await query(`SELECT id,title,summary,outcome,embedding <=> $1::VECTOR AS distance FROM repair_memories WHERE organization_id=$2 ORDER BY embedding <=> $1::VECTOR LIMIT 5`, [v, process.env.DEMO_ORG_ID || 'demo-org']);
      memories = result.rows;
    }
    const context = memories.length ? JSON.stringify(memories) : 'No live semantic records were available; use the bounded demonstration evidence: airflow restriction resolved a similar overheating case, while fan replacement failed.';
    const prompt = `You are RepairAtlas, a field-repair diagnostic assistant. Asset: ${assetId}. Current symptom: ${symptom}. Historical evidence: ${context}. Provide a concise recommendation, cite the evidence by outcome, and never invent measurements. Do not authorize destructive or consequential actions. Recommendation:`;
    const recommendation = await reason(prompt) || fallback;
    return NextResponse.json({mode:process.env.BEDROCK_MODEL_ID?'bedrock':'bounded-demo', assetId, recommendation, memories});
  } catch (error) {
    console.error('diagnosis failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({error:'Diagnosis service unavailable'}, {status:503});
  }
}