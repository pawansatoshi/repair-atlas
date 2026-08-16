# RepairAtlas — Final Human Gate

The repository and CI implementation are prepared. Human/cloud access is required only for the remaining external systems that ChatGPT's connected GitHub/Vercel tooling cannot provision for this submission.

## Verified now

- CockroachDB Cloud cluster connection verified manually.
- RepairAtlas schema tables created in CockroachDB.
- `repair_memories` uses `VECTOR(1024)`.
- Vector index exists in the current database.
- GitHub repository contains the application, schema, seed, agent, docs, QA gate, and AWS deployment configuration.
- Typecheck passes in GitHub Actions.
- Lint passes in GitHub Actions.
- Smoke tests pass in GitHub Actions.
- Production build passes in GitHub Actions.
- Secrets are represented only as environment variables/examples.

## Still unverified

- AWS Amplify production deployment.
- Amazon Bedrock model access and real invocation.
- Amazon Bedrock AgentCore runtime deployment/invocation.
- Real CockroachDB vector retrieval from the deployed application.
- Real outcome persistence from the deployed application.
- Production runtime telemetry.
- Final mobile/browser interaction audit on the deployed URL.
- Final three-minute submission video.

## Human Gate 1 — CockroachDB migration

The existing cluster already works, so do not recreate the database.

Run this once in CockroachDB SQL Shell:

```sql
DROP INDEX IF EXISTS repair_memories_embedding_idx;
CREATE VECTOR INDEX IF NOT EXISTS repair_memories_embedding_idx
ON repair_memories (organization_id, asset_id, embedding)
USING COSINE;
```

Then verify:

```sql
SHOW INDEX FROM repair_memories;
```

The index named `repair_memories_embedding_idx` must be present.

## Human Gate 2 — AWS

Create/connect an AWS Amplify Hosting application to this GitHub repository and deploy `main`.

Configure server-side environment variables/secrets from `.env.example`:

```text
DATABASE_URL
DATABASE_SSL=true
DEMO_ORG_ID=demo-org
AWS_REGION=us-east-1
BEDROCK_MODEL_ID
BEDROCK_EMBED_MODEL_ID=amazon.titan-embed-text-v2:0
COCKROACH_MCP_URL=https://cockroachlabs.cloud/mcp
```

Never paste a database password or AWS secret into GitHub files, README, screenshots, or the video.

## Human Gate 3 — Seed real memory

After AWS credentials and Bedrock access are configured, run the seed script from an authenticated development environment:

```bash
npm install
npm run seed
```

Expected result:

```text
Seed complete: inserted=3 skipped=0 organization=demo-org
```

A second run should report the memories as skipped rather than creating duplicates.

## Human Gate 4 — Real product loop

On the deployed URL:

1. Run diagnosis for `PRESS-204` overheating.
2. Confirm the memory panel reports CockroachDB vector retrieval.
3. Confirm the recommendation cites the successful/failed repair evidence.
4. Approve the diagnostic work order.
5. Confirm the work order is persisted.
6. Record the successful repair outcome.
7. Confirm the work order becomes completed.
8. Confirm a repair event and repair memory are created.
9. Run diagnosis again.
10. Confirm the new/updated memory is retrievable.
11. Refresh the page and confirm persistence remains.

## Human Gate 5 — Production smoke test

Open `/api/health` on the deployed application.

For the full cloud release, the response must show:

```text
status: ok
 database: connected
 tablesReady: true
 vectorMemory: true
 bedrock: true
 embeddings: true
```

The MCP flag can be `true` when the MCP configuration is intentionally exposed to the application environment; the actual CockroachDB MCP authentication remains separately governed by the CockroachDB/AgentCore setup.

## Human Gate 6 — AgentCore

Deploy the bounded agent from `agentcore/repair_agent.py` using the current AWS AgentCore workflow documented in `agentcore/README.md`.

Then invoke the agent with the golden scenario and retain the actual invocation evidence for the submission demo.

## Human Gate 7 — Final evidence

Capture only real evidence:

- public AWS-hosted demo URL
- CockroachDB table/vector evidence
- successful diagnosis
- retrieved memory evidence
- human approval
- persisted work order
- persisted repair outcome
- updated memory
- AgentCore invocation
- production health response
- mobile browser interaction

## Release rule

If any of the cloud gates above are not verified, the final status remains:

**NOT READY**

Do not submit a claim that AWS deployment, Bedrock, AgentCore, or production persistence works until it has actually been observed.
