import { NextRequest, NextResponse } from 'next/server';
import { embed } from '@/lib/bedrock';
import { getPool } from '@/lib/db';
import { hasRuntimeEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const db = getPool();
  let database: 'connected' | 'not_configured' | 'unavailable' = db ? 'unavailable' : 'not_configured';
  let vectorMemory = false;
  let tablesReady = false;
  let repairMemoryCount = 0;
  let embeddedMemoryCount = 0;

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
      const memoryCounts = await db.query<{ total: string; embedded: string }>(
        `SELECT count(*)::STRING AS total,
                count(embedding)::STRING AS embedded
         FROM repair_memories`,
      );
      repairMemoryCount = Number(memoryCounts.rows[0]?.total || 0);
      embeddedMemoryCount = Number(memoryCounts.rows[0]?.embedded || 0);
    } catch {
      database = 'unavailable';
    }
  }

  const degraded = database === 'unavailable' || (database === 'connected' && !tablesReady);
  const bedrock = hasRuntimeEnv('BEDROCK_MODEL_ID');
  const embeddings = hasRuntimeEnv('BEDROCK_EMBED_MODEL_ID');
  const embeddingCoverage = repairMemoryCount > 0 ? embeddedMemoryCount / repairMemoryCount : 0;

  const result: Record<string, unknown> = {
    status: degraded ? 'degraded' : 'ok',
    database,
    databaseConfigured: hasRuntimeEnv('DATABASE_URL'),
    tablesReady,
    vectorMemory,
    bedrock,
    embeddings,
    repairMemoryCount,
    embeddedMemoryCount,
    embeddingCoverage,
    mcp: hasRuntimeEnv('COCKROACH_MCP_URL'),
    runtimeConfigSource: process.env.secrets ? 'amplify-secrets-or-env' : 'environment',
    timestamp: new Date().toISOString(),
  };

  if (req.nextUrl.searchParams.get('probe') === 'embedding') {
    try {
      const vector = await embed('RepairAtlas production embedding smoke test');
      result.embeddingProbe = { ok: Boolean(vector), dimensions: vector?.length || 0 };
    } catch (error) {
      result.embeddingProbe = { ok: false, dimensions: 0 };
      console.error('embedding health probe failed', error instanceof Error ? error.message : 'unknown');
    }
  }

  return NextResponse.json(result, { status: degraded ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
}
