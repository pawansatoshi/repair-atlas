import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Pool } from 'pg';

const db = process.env.DATABASE_URL;
const model = process.env.BEDROCK_EMBED_MODEL_ID;
const organizationId = process.env.DEMO_ORG_ID || 'demo-org';
const embeddingRegion = process.env.BEDROCK_EMBED_REGION || process.env.AWS_REGION || 'eu-north-1';

if (!db || !model) {
  throw new Error('DATABASE_URL and BEDROCK_EMBED_MODEL_ID are required for deterministic cloud seeding');
}

const client = new BedrockRuntimeClient({ region: embeddingRegion });
const pool = new Pool({
  connectionString: db,
  max: 2,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: true },
});

const records = [
  ['PRESS-204', 'Airflow restriction after extended runtime', 'Intake obstruction was cleared and filter replaced; overheating resolved without motor replacement.', 'resolved'],
  ['PRESS-204', 'Fan replacement did not resolve overheating', 'A prior attempt replaced the fan assembly without resolving the thermal symptom.', 'failed'],
  ['PRESS-204', 'Dust-loaded intake filter', 'Cleaning the intake path and replacing a saturated filter restored stable operating temperature.', 'resolved'],
] as const;

async function embedding(text: string) {
  const command = new InvokeModelCommand({
    modelId: model,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ inputText: text.slice(0, 8000) }),
  });
  const response = await client.send(command);
  const data = JSON.parse(new TextDecoder().decode(response.body));
  if (!Array.isArray(data.embedding) || data.embedding.length !== 1024) {
    throw new Error(`Embedding model must return exactly 1024 dimensions; received ${Array.isArray(data.embedding) ? data.embedding.length : 'none'}`);
  }
  return `[${data.embedding.map(Number).join(',')}]`;
}

async function main() {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    await dbClient.query(
      `INSERT INTO organizations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [organizationId, 'RepairAtlas Demo'],
    );
    await dbClient.query(
      `INSERT INTO assets (id, organization_id, name, model, site, status)
       VALUES ($1, $2, $1, 'Hydraulic Press', 'Site 07 · Line B', 'attention')
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id`,
      ['PRESS-204', organizationId],
    );
    await dbClient.query('COMMIT');

    let inserted = 0;
    let repaired = 0;
    let skipped = 0;

    for (const [assetId, title, summary, outcome] of records) {
      const existing = await dbClient.query<{ id: string; has_embedding: boolean }>(
        `SELECT id, embedding IS NOT NULL AS has_embedding
         FROM repair_memories
         WHERE organization_id = $1 AND asset_id = $2 AND title = $3
         LIMIT 1`,
        [organizationId, assetId, title],
      );

      if (existing.rowCount) {
        if (existing.rows[0].has_embedding) {
          skipped += 1;
          continue;
        }

        const vector = await embedding(`${assetId} ${title}. ${summary}`);
        await dbClient.query(
          `UPDATE repair_memories
           SET embedding = $1::VECTOR
           WHERE id = $2 AND organization_id = $3 AND asset_id = $4 AND embedding IS NULL`,
          [vector, existing.rows[0].id, organizationId, assetId],
        );
        repaired += 1;
        continue;
      }

      const event = await dbClient.query<{ id: string }>(
        `INSERT INTO repair_events (organization_id, asset_id, action, observation, outcome)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [organizationId, assetId, title, summary, outcome],
      );
      const vector = await embedding(`${assetId} ${title}. ${summary}`);
      await dbClient.query(
        `INSERT INTO repair_memories
         (organization_id, asset_id, title, summary, outcome, embedding, source_event_id)
         VALUES ($1, $2, $3, $4, $5, $6::VECTOR, $7)`,
        [organizationId, assetId, title, summary, outcome, vector, event.rows[0].id],
      );
      inserted += 1;
    }

    console.log(`Seed complete: inserted=${inserted} repaired=${repaired} skipped=${skipped} organization=${organizationId}`);
  } finally {
    dbClient.release();
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error('seed failed:', error instanceof Error ? error.message : 'unknown error');
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
