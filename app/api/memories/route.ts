import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const demo = [
  {id:'mem-01',title:'Airflow restriction after extended runtime',summary:'Similar PRESS-204 incident. Intake obstruction was cleared and filter replaced; motor replacement was unnecessary.',outcome:'resolved',relevance:0.96},
  {id:'mem-02',title:'Fan replacement did not resolve overheating',summary:'A prior attempt replaced the fan assembly without resolving the thermal symptom.',outcome:'failed',relevance:0.88},
  {id:'mem-03',title:'Dust-loaded intake filter',summary:'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.',outcome:'resolved',relevance:0.81},
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptom = typeof body?.symptom === 'string' ? body.symptom.trim().slice(0, 1000) : '';
    if (!symptom) return NextResponse.json({error:'symptom is required'}, {status:400});
    if (!process.env.DATABASE_URL) return NextResponse.json({mode:'demo', memories:demo});
    const embedding = body?.embedding;
    if (!Array.isArray(embedding) || embedding.length === 0) return NextResponse.json({error:'embedding is required for semantic retrieval'}, {status:400});
    const vector = `[${embedding.map((v: unknown)=>Number(v)).filter(Number.isFinite).join(',')}]`;
    const result = await query<{id:string;title:string;summary:string;outcome:string;distance:number}>(
      `SELECT id, title, summary, outcome, embedding <=> $1::VECTOR AS distance FROM repair_memories WHERE organization_id = $2 ORDER BY embedding <=> $1::VECTOR LIMIT 5`, [vector, process.env.DEMO_ORG_ID || 'demo-org']
    );
    return NextResponse.json({mode:'cockroachdb-vector', memories:result.rows.map(r=>({...r,relevance:Math.max(0,1-Number(r.distance))}))});
  } catch (error) {
    console.error('memory retrieval failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({error:'Memory retrieval unavailable'}, {status:503});
  }
}