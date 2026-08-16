import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const db = getPool();
  let database: 'connected' | 'not_configured' | 'unavailable' = db ? 'unavailable' : 'not_configured';
  if (db) {
    try { await db.query('SELECT 1'); database = 'connected'; } catch { database = 'unavailable'; }
  }
  return NextResponse.json({ status: database === 'unavailable' ? 'degraded' : 'ok', database, vectorMemory: database === 'connected', bedrock: Boolean(process.env.AWS_REGION && process.env.BEDROCK_MODEL_ID), mcp: Boolean(process.env.COCKROACH_MCP_URL), timestamp: new Date().toISOString() }, { status: database === 'unavailable' ? 503 : 200, headers: {'Cache-Control':'no-store'} });
}