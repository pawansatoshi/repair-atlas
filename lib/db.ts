import { Pool, type PoolClient } from 'pg';

let pool: Pool | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) return undefined;
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX || 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: true },
  });
  return pool;
}

export async function query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const db = getPool();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  return db.query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const db = getPool();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
