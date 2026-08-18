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

## 2026-08-17 to 2026-08-18 — Production hardening, AgentCore investigation, and judge UX

### What the debugging process taught us

The later build phase was not a straight line from code to demo. We repeatedly validated the actual deployed behavior instead of assuming that a green build meant the agent worked.

Observed issues included:

1. **Amplify runtime configuration boundary:** the Next.js server initially could not see selected app-level environment variables even though the Amplify build had them. We added the SSR environment bridge documented for the deployment path and rechecked the live API.
2. **AgentCore invocation serialization failure:** a live AgentCore runtime test failed with `TypeError: Object of type UUID is not JSON serializable`. This identified a concrete data-boundary problem in the runtime invocation path. We treated it as a serialization/integration defect, not an AI reasoning defect, and kept independent AgentCore runtime verification as an explicit release gate.
3. **AgentCore runtime version investigation:** the AWS console was inspected across deployed runtime versions; the latest listed runtime reached `READY` while older versions included `UPDATE_FAILED` states. This was used as deployment evidence, not hidden from the reviewer.
4. **Repository-vs-temporary-path debugging:** several shell searches were accidentally aimed at temporary extraction directories rather than the repository root. These were corrected and not misreported as application bugs.

### Production behavior subsequently demonstrated

The deployed RepairAtlas application was manually exercised through the golden PRESS-204 scenario:

```text
PRESS-204 overheating
      ↓
retrieve repair memory
      ↓
compare successful + failed interventions
      ↓
bounded recommendation
      ↓
human approval
      ↓
diagnostic work order created
      ↓
repair outcome recorded
      ↓
repair memory persisted
      ↓
completed state remains visible after refresh
```

The live UI showed four relevant memories, including a failed fan replacement and successful airflow/filter interventions. The recommendation favored inspecting airflow before replacing the motor. The work-order action was explicitly approval-gated. The successful outcome was then persisted as durable repair memory and became visible in subsequent retrieval.

### Product / judge-facing improvements

The main product UI was kept operational rather than turned into a documentation page. It now also explains:

- how to describe an incident in normal language
- how retrieval and reasoning work
- how to approve and record a repair
- why failed interventions are useful negative evidence
- how factory teams can preserve expertise and reduce repeated mistakes
- what the product does and does not automate
- a compact FAQ with expandable answers
- example incident prompts for a first-time judge

A separate interactive architecture/judge page was added at `/architecture`. It lets a reviewer click through the system components, inspect the memory loop, expand the real debugging findings, and read judge-oriented FAQs.

### Current evidence discipline

The repository intentionally distinguishes:

- **Verified:** observed in the deployed application or directly validated in AWS/CockroachDB.
- **Partial:** implementation/configuration exists but the full end-to-end behavior is not yet independently proven.
- **Pending:** a release check still required before public submission.

The AgentCore runtime is documented this way rather than being presented as fully verified merely because the project configuration exists.

### Final release principle

The project is not judged by how many AWS services appear in the architecture. AWS is useful here because it provides concrete capabilities: production hosting through Amplify, model inference/embeddings through Bedrock, and a managed agent-runtime path through AgentCore. CockroachDB remains the operational source of truth and durable semantic memory.

The core engineering proof is:

**incident → retrieve → reason → approve → act → record outcome → remember → improve the next incident**.

### Next validation target

Before final submission, rerun the release/security gates after the final code change, verify the final deployment, confirm the remaining AgentCore/MCP status accurately, and capture the golden demo video from the deployed application.

## Evidence discipline

- Keep the roadmap/blueprint and release checklist intact.
- Record meaningful debugging discoveries here as they happen.
- Record only verified facts; distinguish `verified`, `partial`, and `not verified`.
- Never commit AWS credentials, database URLs containing secrets, tokens, or temporary CloudShell logs containing sensitive values.
- This log is a reference for future agents/reviewers so they can continue from the latest verified state without repeating completed debugging work.
