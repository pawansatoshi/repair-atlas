# RepairAtlas Development & Debugging Log

This file records verified implementation, debugging findings, environment blockers, and validation evidence during the hackathon build. Update it as the implementation progresses. Do not record secrets or full credential values.

## 2026-08-16 — CloudShell validation session

### Verified

- Repository cloned successfully from `pawansatoshi/repair-atlas`.
- Working tree is clean and synchronized with `origin/main` at the start of the CloudShell session.
- CockroachDB Cloud connection works when using the Lambda environment's `COCKROACHDB_URL`.
- The local Unix PostgreSQL socket is not the application database and must not be used for validation.
- Repair memory record exists in CockroachDB for `demo-org` / `asset-demo-001` with title `Hydraulic Pump Overheating Inspection`, outcome `resolved`, and a non-null embedding.
- Amazon Titan Text Embeddings V2 is returning 1,024-dimensional embeddings as required by the `VECTOR(1024)` schema.
- Invalid-memory-ID behavior is correctly rejected rather than silently accepted.
- `npm test` passes: 4 tests, 0 failures.
- `npm run build` passes successfully with Next.js production optimization completed.
- `npm run lint` completes successfully.
- After installing the missing TypeScript development dependency, `npm run typecheck` completes successfully.
- Deterministic seed completes successfully after exporting the required runtime variables: `DATABASE_URL` and `BEDROCK_EMBED_MODEL_ID`.
- Seed result: `inserted=3`, `skipped=0`, organization `demo-org`.

### Debugging findings and resolutions

#### 1. Invalid API host / URL construction

**Finding:** Early `curl` attempts produced `curl: (3) URL rejected: No host part in the URL` because the API endpoint variable was not populated correctly.

**Resolution:** Re-read the API Gateway endpoint from AWS and use the resolved endpoint in `API_ENDPOINT` before making requests.

#### 2. Invalid memory IDs

**Finding:** `POST /api/embeddings` returned `400` with `memory_id must be a valid UUID` for placeholder/non-UUID IDs.

**Resolution:** Use the actual UUID returned by the embedding/memory creation path. Deliberately malformed UUIDs remain negative-test cases.

#### 3. Local PostgreSQL socket confusion

**Finding:** Direct `psql` without the CockroachDB URL attempted `/var/run/postgresql/.s.PGSQL.5432` and failed with `No such file or directory`.

**Resolution:** Validate against the CockroachDB Cloud connection supplied by the AWS Lambda environment rather than assuming a local PostgreSQL server exists.

#### 4. CloudShell filesystem boundary

**Finding:** `/repair-atlas` did not exist and initial `git status`/`find` commands were run before cloning the repository.

**Resolution:** Clone `https://github.com/pawansatoshi/repair-atlas.git`, enter the repository, then run source and test commands from the repository root.

#### 5. Missing TypeScript compiler in the environment

**Finding:** `npm run typecheck` initially failed with `tsc: command not found`.

**Resolution:** Install project development dependencies with `npm install --include=dev`. Typecheck then became available and completed successfully.

#### 6. CloudShell disk exhaustion during dependency installation

**Finding:** `npm install --include=dev` initially reported `ENOSPC: no space left on device`. Inspection showed the CloudShell home filesystem was effectively full, including the npm cache and `node_modules`.

**Resolution:** Remove the temporary npm cache (`~/.npm/_cacache`) and reinstall dependencies. The subsequent install completed successfully and reduced the blocking disk-pressure condition.

**Note:** The CloudShell environment is ephemeral. Disk cleanup is an environment operation, not an application code change.

#### 7. Deterministic seed requires runtime configuration

**Finding:** `npm run seed` initially failed with `DATABASE_URL and BEDROCK_EMBED_MODEL_ID are required for deterministic cloud seeding`.

**Resolution:** Export the already-configured runtime database URL from `COCKROACHDB_URL` and set `BEDROCK_EMBED_MODEL_ID=amazon.titan-embed-text-v2:0`, then rerun the seed.

**Result:** Seed completed successfully with `inserted=3`, `skipped=0`.

### Current verification state

| Area | Status | Evidence |
|---|---|---|
| Repository sync | PASS | `git status` clean / up to date |
| CockroachDB connectivity | PASS | Cloud database query succeeds |
| Relational repair memory | PASS | Seeded/queried record present |
| Vector embedding | PASS | Titan V2 / 1024 dimensions |
| Semantic memory foundation | PASS | Persisted record has embedding |
| Negative UUID validation | PASS | Invalid IDs rejected |
| Unit/release contract tests | PASS | 4/4 tests |
| TypeScript typecheck | PASS | `tsc --noEmit` succeeds after dependency install |
| Production build | PASS | `next build` succeeds |
| Lint | PASS | `npm run lint` succeeds |
| Deterministic seed | PASS | 3 inserted, 0 skipped |
| Full memory closed loop | OPEN | Retrieval → recommendation → approval → work order → outcome → memory → second incident still needs end-to-end proof |
| Agent orchestration | PARTIAL | Core implementation exists; full live workflow still needs proof |
| Managed MCP | PARTIAL | Architecture/configuration present; full governed operation verification remains |
| Product UI | NOT COMPLETE | Operational screens and states remain to be verified |
| Security/reliability audit | NOT COMPLETE | Final gate remains |
| AWS deployment proof | NOT COMPLETE | Must be verified for final submission |
| Final demo evidence | NOT COMPLETE | Golden scenario and second-incident learning need recorded proof |

### Next validation target

Run a real semantic retrieval request against the seeded `demo-org` data using the live API. Confirm that the returned memories are asset/organization scoped and that outcome-aware retrieval distinguishes successful and unsuccessful repair experiences.

Then prove the complete closed loop:

```text
incident
→ retrieve memory
→ agent recommendation
→ explicit approval
→ work-order write
→ technician outcome
→ repair event
→ memory write + embedding
→ second incident
→ learned retrieval
```

### Evidence discipline

- Keep the roadmap/blueprint and release checklist intact.
- Record meaningful debugging discoveries here as they happen.
- Record only verified facts; distinguish `verified`, `partial`, and `not verified`.
- Never commit AWS credentials, database URLs containing secrets, tokens, or temporary CloudShell logs containing sensitive values.
- This log is a reference for future agents/reviewers so they can continue from the latest verified state without repeating completed debugging work.
