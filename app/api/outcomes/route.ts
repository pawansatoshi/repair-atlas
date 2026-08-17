import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { embed } from '@/lib/bedrock';
import { withTransaction } from '@/lib/db';
import { getRuntimeEnv } from '@/lib/env';

const inputSchema = z.object({
  assetId: z.string().trim().min(1).max(100),
  summary: z.string().trim().min(1).max(2000),
  outcome: z.enum(['resolved', 'failed']),
}).strict();

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'application/json is required' }, { status: 415 });
    }
    const body = inputSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: 'assetId, summary and outcome are required' }, { status: 400 });

    const { assetId, summary, outcome } = body.data;
    const organizationId = getRuntimeEnv('DEMO_ORG_ID') || 'demo-org';
    if (!getRuntimeEnv('DATABASE_URL')) return NextResponse.json({ mode: 'demo', id: `mem-${Date.now()}`, status: 'persisted', outcome });

    const vector = await embed(`${assetId} ${summary} ${outcome}`);
    if (!vector) return NextResponse.json({ error: 'embedding service unavailable' }, { status: 503 });
    if (vector.length !== 1024) return NextResponse.json({ error: 'embedding dimension mismatch' }, { status: 503 });

    const result = await withTransaction(async (client) => {
      const asset = await client.query<{ id: string }>(
        `SELECT id FROM assets WHERE id = $1 AND organization_id = $2 LIMIT 1`,
        [assetId, organizationId],
      );
      if (!asset.rowCount) throw new Error('ASSET_NOT_FOUND');

      const workOrder = await client.query<{ id: string }>(
        `SELECT id FROM work_orders
         WHERE organization_id = $1 AND asset_id = $2 AND status IN ('open','staged')
         ORDER BY created_at DESC LIMIT 1`,
        [organizationId, assetId],
      );
      if (!workOrder.rowCount) throw new Error('WORK_ORDER_NOT_FOUND');

      const event = await client.query<{ id: string }>(
        `INSERT INTO repair_events (organization_id, asset_id, work_order_id, action, observation, outcome)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [organizationId, assetId, workOrder.rows[0].id, 'technician_repair_outcome', summary, outcome],
      );

      const memory = await client.query<{ id: string }>(
        `INSERT INTO repair_memories
         (organization_id, asset_id, title, summary, outcome, embedding, source_event_id)
         VALUES ($1, $2, $3, $4, $5, $6::VECTOR, $7) RETURNING id`,
        [organizationId, assetId, `${outcome === 'resolved' ? 'Successful' : 'Failed'} intervention on ${assetId}`, summary, outcome, `[${vector.join(',')}]`, event.rows[0].id],
      );

      await client.query(
        `UPDATE work_orders SET status = 'completed', updated_at = now() WHERE id = $1`,
        [workOrder.rows[0].id],
      );
      await client.query(
        `INSERT INTO audit_events (organization_id, actor_type, actor_id, action, resource_type, resource_id, metadata)
         VALUES ($1, 'demo_user', $2, 'recorded_repair_outcome', 'repair_memory', $3, $4::JSONB)`,
        [organizationId, 'demo-technician', memory.rows[0].id, JSON.stringify({ assetId, outcome, workOrderId: workOrder.rows[0].id })],
      );

      return { id: memory.rows[0].id, eventId: event.rows[0].id, workOrderId: workOrder.rows[0].id };
    });

    return NextResponse.json({ mode: 'cockroachdb', ...result, status: 'persisted', outcome }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof Error && error.message === 'ASSET_NOT_FOUND') {
      return NextResponse.json({ error: 'Asset is not available in the configured organization' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'WORK_ORDER_NOT_FOUND') {
      return NextResponse.json({ error: 'Create and approve a work order before recording an outcome' }, { status: 409 });
    }
    console.error('outcome persistence failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Unable to persist repair outcome' }, { status: 503 });
  }
}
