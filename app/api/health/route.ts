import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const db = getPool();
  let database: 'connected' | 'not_configured' | 'unavailable' = db ? 'unavailable' : 'not_configured';
  let vectorMemory = false;
  let tablesReady = false;

  if (db) {
    try {
      await db.query('SELECT 1');
      database = 'connected';
      const tableCheck = await db.query<{ count: string }>(
        `SELECT count(*)::STRING AS count
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name IN ('organizations','assets','work_orders','repair_events','repair_memories','agent_sessions','agent_actions','audit_events')`,
      );
      tablesReady = Number(tableCheck.rows[0]?.count || 0) === 8;
      const indexCheck = await db.query<{ count: string }>(
        `SELECT count(*)::STRING AS count
         FROM [SHOW INDEX FROM repair_memories]
         WHERE index_name = 'repair_memories_embedding_idx'`,
      );
      vectorMemory = tablesReady && Number(indexCheck.rows[0]?.count || 0) > 0;
    } catch {
      database = 'unavailable';
    }
  }

  const degraded = database === 'unavailable' || (database === 'connected' && !tablesReady);
  return NextResponse.json({
    status: degraded ? 'degraded' : 'ok',
    database,
    tablesReady,
    vectorMemory,
    bedrock: Boolean(process.env.AWS_REGION && process.env.BEDROCK_MODEL_ID),
    embeddings: Boolean(process.env.AWS_REGION && process.env.BEDROCK_EMBED_MODEL_ID),
    mcp: Boolean(process.env.COCKROACH_MCP_URL),
    timestamp: new Date().toISOString(),
  }, { status: degraded ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
}
