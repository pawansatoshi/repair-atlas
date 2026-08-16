import { NextRequest, NextResponse } from 'next/server';
import { embed } from '@/lib/bedrock';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assetId = typeof body?.assetId === 'string' ? body.assetId.trim().slice(0,100) : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim().slice(0,2000) : '';
    const outcome = body?.outcome === 'resolved' || body?.outcome === 'failed' ? body.outcome : '';
    if (!assetId || !summary || !outcome) return NextResponse.json({error:'assetId, summary and outcome are required'}, {status:400});
    const vector = await embed(`${assetId} ${summary} ${outcome}`);
    if (!process.env.DATABASE_URL) return NextResponse.json({mode:'demo', id:`mem-${Date.now()}`, status:'persisted', outcome});
    if (!vector) return NextResponse.json({error:'embedding service unavailable'}, {status:503});
    const result = await query<{id:string}>(`INSERT INTO repair_memories (organization_id,asset_id,title,summary,outcome,embedding,created_at) VALUES ($1,$2,$3,$4,$5,$6::VECTOR,now()) RETURNING id`, [process.env.DEMO_ORG_ID || 'demo-org',assetId,`${outcome==='resolved'?'Successful':'Failed'} intervention on ${assetId}`,summary,outcome,`[${vector.join(',')}]`]);
    return NextResponse.json({mode:'cockroachdb',id:result.rows[0]?.id,status:'persisted',outcome});
  } catch (error) {
    console.error('outcome persistence failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({error:'Unable to persist repair outcome'}, {status:503});
  }
}