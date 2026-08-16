import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const inputSchema = z.object({
  symptom: z.string().trim().min(1).max(1000),
  assetId: z.string().trim().min(1).max(100),
  embedding: z.array(z.number().finite()).length(1024),
}).strict();

const demo = [
  {id:'mem-01',title:'Airflow restriction after extended runtime',summary:'Similar PRESS-204 incident. Intake obstruction was cleared and filter replaced; motor replacement was unnecessary.',outcome:'resolved',relevance:0.96},
  {id:'mem-02',title:'Fan replacement did not resolve overheating',summary:'A prior attempt replaced the fan assembly without resolving the thermal symptom.',outcome:'failed',relevance:0.88},
  {id:'mem-03',title:'Dust-loaded intake filter',summary:'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.',outcome:'resolved',relevance:0.81},
];

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'application/json is required' }, { status: 415 });
    }
    const body = inputSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: 'symptom, assetId and a 1024-dimensional embedding are required' }, { status: 400 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ mode:'demo', memories:demo });

    const organizationId = process.env.DEMO_ORG_ID || 'demo-org';
    const vector = `[${body.data.embedding.join(',')}]`;
    const result = await query<{id:string;title:string;summary:string;outcome:string;distance:number}>(
      `SELECT id, title, summary, outcome, embedding <=> $1::VECTOR AS distance
       FROM repair_memories
       WHERE organization_id = $2 AND asset_id = $3 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::VECTOR
       LIMIT 5`,
      [vector, organizationId, body.data.assetId],
    );
    return NextResponse.json({
      mode:'cockroachdb-vector',
      memories:result.rows.map(r=>({...r,relevance:Math.max(0,1-Number(r.distance))})),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('memory retrieval failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({error:'Memory retrieval unavailable'}, {status:503});
  }
}
