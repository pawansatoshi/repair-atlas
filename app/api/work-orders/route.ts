import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query, withTransaction } from '@/lib/db';
import { getRuntimeEnv } from '@/lib/env';

const inputSchema = z.object({
  approved: z.literal(true),
  assetId: z.string().trim().min(1).max(100),
}).strict();

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'application/json is required' }, { status: 415 });
    }
    const body = inputSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: 'explicit approval and a valid assetId are required' }, { status: 400 });

    const { assetId } = body.data;
    const organizationId = getRuntimeEnv('DEMO_ORG_ID') || 'demo-org';
    if (!getRuntimeEnv('DATABASE_URL')) return NextResponse.json({ mode: 'demo', id: 'WO-2049', status: 'staged' });

    const existing = await query<{ id: string; status: string }>(
      `SELECT id, status FROM work_orders
       WHERE organization_id = $1 AND asset_id = $2 AND status IN ('open','staged')
       ORDER BY created_at DESC LIMIT 1`,
      [organizationId, assetId],
    );
    if (existing.rowCount) {
      return NextResponse.json({ mode: 'cockroachdb', ...existing.rows[0], reused: true }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const result = await withTransaction(async (client) => {
      const asset = await client.query<{ id: string }>(
        `SELECT id FROM assets WHERE id = $1 AND organization_id = $2 LIMIT 1`,
        [assetId, organizationId],
      );
      if (!asset.rowCount) throw new Error('ASSET_NOT_FOUND');

      const workOrder = await client.query<{ id: string; status: string }>(
        `INSERT INTO work_orders (organization_id, asset_id, title, status)
         VALUES ($1, $2, $3, 'open') RETURNING id, status`,
        [organizationId, assetId, `Diagnostic inspection — ${assetId}`],
      );
      const workOrderId = workOrder.rows[0].id;
      const session = await client.query<{ id: string }>(
        `INSERT INTO agent_sessions (organization_id, asset_id, status) VALUES ($1, $2, 'active') RETURNING id`,
        [organizationId, assetId],
      );
      await client.query(
        `INSERT INTO agent_actions (session_id, action, approval_required, approved, status, result)
         VALUES ($1, 'create_diagnostic_work_order', true, true, 'completed', $2::JSONB)`,
        [session.rows[0].id, JSON.stringify({ workOrderId, assetId })],
      );
      await client.query(
        `INSERT INTO audit_events (organization_id, actor_type, actor_id, action, resource_type, resource_id, metadata)
         VALUES ($1, 'demo_user', $2, 'approved_work_order', 'work_order', $3, $4::JSONB)`,
        [organizationId, 'demo-technician', workOrderId, JSON.stringify({ assetId, approval: true })],
      );
      return workOrder.rows[0];
    });

    return NextResponse.json({ mode: 'cockroachdb', ...result, reused: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof Error && error.message === 'ASSET_NOT_FOUND') {
      return NextResponse.json({ error: 'Asset is not available in the configured organization' }, { status: 404 });
    }
    console.error('work order create failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Unable to create work order' }, { status: 503 });
  }
}
