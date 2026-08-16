import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.approved !== true) return NextResponse.json({error:'explicit approval is required'}, {status:403});
    const assetId = typeof body?.assetId === 'string' ? body.assetId.trim().slice(0,100) : '';
    if (!assetId) return NextResponse.json({error:'assetId is required'}, {status:400});
    if (!process.env.DATABASE_URL) return NextResponse.json({mode:'demo', id:'WO-2049', status:'staged'});
    const result = await query<{id:string;status:string}>(`INSERT INTO work_orders (organization_id,asset_id,title,status,created_at) VALUES ($1,$2,$3,'open',now()) RETURNING id,status`, [process.env.DEMO_ORG_ID || 'demo-org', assetId, `Diagnostic inspection — ${assetId}`]);
    return NextResponse.json({mode:'cockroachdb', ...result.rows[0]});
  } catch (error) {
    console.error('work order create failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({error:'Unable to create work order'}, {status:503});
  }
}