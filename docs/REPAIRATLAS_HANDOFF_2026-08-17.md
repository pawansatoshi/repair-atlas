# RepairAtlas — Engineering Handoff & Submission State

**Date:** 2026-08-17  
**Repository:** `pawansatoshi/repair-atlas`  
**Branch:** `main`  
**Purpose:** Preserve the complete engineering state for a new chat/agent so work continues from evidence instead of repeating already-solved bugs.

> **Evidence rule:** `UNKNOWN != PASS`. A deployment can be green while a runtime capability is still unproven. Do not mark the final release ready until the real production memory loop is demonstrated.

---

## 1. Project goal

RepairAtlas is an agentic field-operations console for the CockroachDB × AWS hackathon. Its core thesis is that repair history should become durable operational memory:

```text
incident
  -> asset context
  -> CockroachDB repair memory
  -> vector retrieval
  -> Bedrock reasoning
  -> bounded recommendation
  -> human approval
  -> work order
  -> technician outcome
  -> repair event + durable memory
  -> next incident learns from the outcome
```

Primary differentiator: CockroachDB is both the transactional system of record and the semantic memory layer; the product does not require a second vector database.

Golden scenario:

- Asset: `PRESS-204`
- Symptom: overheating after extended operation
- Evidence includes successful airflow/filter interventions and a failed fan replacement
- Expected recommendation: inspect intake airflow/filter condition before replacing the motor
- Consequential work-order creation is behind explicit human approval

---

## 2. What has been successfully completed / fixed

### Application and repository

- Public GitHub repository is active and pushed on `main`.
- Next.js/React application, API routes, database layer, Bedrock integration, AgentCore implementation, docs, seed scripts, security/release templates and CI are present.
- Production build path is working.
- Automated quality gates previously verified: **typecheck PASS, lint PASS, tests 4/4 PASS, production build PASS**.

### CockroachDB

- CockroachDB connection path established.
- Required tables/schema are ready.
- Repair memories are persisted.
- Vector column is `VECTOR(1024)`.
- Titan Text Embeddings V2 is used for 1,024-dimensional embeddings.
- Vector retrieval path was implemented using CockroachDB vector distance with asset/organization scoping.
- Missing-memory embedding backfill was added.
- Current user-provided production health evidence:

```json
{
  "status":"ok",
  "database":"connected",
  "databaseConfigured":true,
  "tablesReady":true,
  "vectorMemory":true,
  "bedrock":true,
  "embeddings":true,
  "repairMemoryCount":4,
  "embeddedMemoryCount":4,
  "embeddingCoverage":1,
  "mcp":true,
  "runtimeConfigSource":"environment"
}
```

This proves the database and stored embedding coverage are healthy at the time of that probe. It does **not** by itself prove that a fresh live embedding request from the deployed diagnosis path succeeds every time.

### AWS / Amplify

- AWS Amplify deployment pipeline is functioning.
- Multiple production deployments completed with status `Deployed`.
- Latest deployment observed by the user: **Deployment 21**, commit message beginning `ui: label native vector search...`, deployed successfully.
- Amplify build sequence has passed dependency install, typecheck, lint, tests, Next.js build and deployment.
- Earlier Amplify DNS/access issue was transient; the public application subsequently became reachable.
- Amplify SSR environment-variable bridge was added to make selected build variables available to Next.js server runtime.
- AWS-reserved `AWS_REGION` environment-variable issue was identified and removed from Amplify app configuration; runtime region fallback remains in code.

### Bedrock / Anthropic

- Amazon Bedrock is configured in the deployed application path.
- Anthropic model catalog was inspected.
- Anthropic first-time use-case submission requirement was encountered and the user **submitted the Anthropic use-case details** successfully.
- Claude Sonnet 4.6 was the model page used for the use-case submission flow.
- Titan Text Embeddings V2 remains the embedding model used by RepairAtlas.
- A production embedding health probe was added to `/api/health?probe=embedding` so embedding invocation can be tested directly rather than inferred from configuration flags.

### Diagnosis / agent workflow

- Diagnosis endpoint validates input.
- It attempts a live Bedrock embedding.
- It can backfill missing memory embeddings.
- It performs asset/organization-scoped CockroachDB vector retrieval.
- It falls back to recent CockroachDB memories when vector retrieval is unavailable.
- It has a bounded demo fallback only when no database is configured.
- Bedrock reasoning is attempted and bounded fallback recommendation is used if reasoning is unavailable.
- Recommendation explicitly distinguishes successful and failed interventions.
- The UI exposes retrieval mode and memory evidence.

### Human approval / work order

A real UI test reached the approval flow successfully:

- Recommendation shown.
- User pressed **Approve action**.
- UI changed to **Approved**.
- A **Diagnostic work order created** state appeared with a real work-order identifier.
- UI exposed **Record successful repair** as the next step.

This demonstrates that the approval boundary/work-order path is implemented and was exercised. The final submission still needs a clean end-to-end repeat with runtime embedding/reasoning proven and the outcome recorded into memory.

### Bugs/environment problems already solved

1. CloudShell local PostgreSQL socket confusion — resolved by using the configured CockroachDB URL.
2. Invalid memory UUID validation/persistence defect — corrected; malformed UUIDs return 400 and nonexistent valid UUIDs return 404.
3. Missing `tsc` development dependency — resolved with dev dependency installation.
4. CloudShell `ENOSPC` disk pressure — resolved by cleaning `node_modules`/npm cache and reinstalling.
5. Missing Git author identity — configured locally; no credentials committed.
6. GitHub HTTPS password-auth failure — resolved using repository-scoped token authentication; token not stored in repository.
7. Non-fast-forward Git history — resolved with rebase and successful push.
8. Amplify reserved `AWS_*` environment variable issue — `AWS_REGION` removed from Amplify environment configuration.
9. Amplify/Next.js SSR runtime environment visibility — addressed with the `.env.production` build bridge and runtime environment helper.
10. Missing-memory embedding backfill — implemented.
11. Vector diagnosis retrieval implementation — implemented and refined for CockroachDB vector distance.
12. Health endpoint observability — expanded to expose safe database/vector/embedding coverage information and a production embedding probe.
13. Repair-seed persistence — deterministic seed completed with `inserted=3`, `skipped=0`, organization `demo-org` during the verified setup session.
14. Production embedding coverage — user-provided health evidence shows `4/4` repair memories embedded.

---

## 3. Current known problem — DO NOT declare it fixed yet

The remaining visible issue is an **intermittent production embedding/diagnosis runtime failure**.

The UI has shown messages such as:

- `embedding service unavailable`
- `CockroachDB memory retrieved without semantic ranking`

while the health endpoint can simultaneously report:

- `bedrock: true`
- `embeddings: true`
- `embeddingCoverage: 1`

Therefore configuration presence and stored embedding coverage are green, but **fresh runtime embedding invocation is not yet proven consistently green**.

Important code evidence:

`lib/bedrock.ts` currently attempts embedding in this order:

1. `REPAIR_ATLAS_EMBEDDING_API_URL` gateway, if configured.
2. Direct Bedrock `InvokeModel` fallback.
3. Returns `undefined` if both fail.

The Amplify build bridge currently exports selected variables but does not currently list `REPAIR_ATLAS_EMBEDDING_API_URL`. If the gateway is required in production, that is a likely runtime configuration gap and must be verified rather than assumed.

`app/api/diagnose/route.ts` catches embedding errors and intentionally continues to recent-memory/fallback behavior. This is useful for resilience but can hide the actual embedding failure from the user-facing result. The next debugging pass should inspect the production embedding probe and logs before changing more architecture.

---

## 4. Exact next diagnostic sequence

### A. Prove fresh embedding invocation first

Open:

```text
https://main.d21vkylsbd9nj.amplifyapp.com/api/health?probe=embedding
```

Expected successful evidence:

```json
"embeddingProbe":{"ok":true,"dimensions":1024}
```

If it returns `ok:false` or `dimensions:0`, do **not** change the UI. Diagnose the server-side Bedrock invocation first.

### B. Inspect the production runtime path

Check, in this order:

1. `BEDROCK_EMBED_MODEL_ID` is present in the Amplify server runtime.
2. The value is exactly the approved Titan embedding model ID used by the project.
3. The runtime region is the region where the model is available.
4. The Amplify SSR runtime IAM role can invoke the embedding model, OR the configured embedding gateway is available.
5. If using the verified embedding gateway, ensure `REPAIR_ATLAS_EMBEDDING_API_URL` is actually available to the Next.js server runtime through the Amplify build bridge.
6. Verify Anthropic use-case submission/model access separately from Titan embedding access; they are different model/provider permissions.
7. Use Amplify logs to capture the actual Bedrock error without exposing credentials.

### C. Only after the probe is green

Run the full production diagnosis:

```text
PRESS-204 + overheating after extended operation
```

Expected:

- fresh embedding succeeds
- `retrievalMode` is `cockroachdb-vector`
- memory results contain distance/relevance values
- Bedrock reasoning is available (`mode=bedrock`, `reasoningAvailable=true`) when model access is configured
- recommendation is evidence-grounded
- no `embedding service unavailable` state

### D. Verify the write loop

1. Approve action.
2. Confirm diagnostic work order is created.
3. Record successful repair.
4. Confirm repair event/outcome persisted.
5. Confirm a new durable memory is created/embedded.
6. Confirm `/api/health` memory counts increase and embedding coverage remains 100%.

### E. Prove learning, not just persistence

Run a second incident with different wording, for example:

```text
PRESS-204 is running hot after a long production cycle; cooling performance is degrading.
```

Expected:

- vector retrieval returns the prior successful airflow/filter experience
- the failed fan replacement is still distinguished as a failed intervention
- recommendation remains bounded and evidence-grounded
- no hard-coded demo evidence is required

This is the most important proof for the hackathon thesis.

---

## 5. Remaining work before submission

### Blocking

- [ ] Fresh production embedding probe returns `ok:true`, `dimensions:1024` consistently.
- [ ] Production Bedrock reasoning is proven from the deployed Amplify runtime.
- [ ] Diagnosis consistently reports real vector retrieval rather than fallback/recent retrieval.
- [ ] Full approval → work order → technician outcome → memory persistence loop is verified end-to-end.
- [ ] Second incident proves newly learned memory is retrieved.
- [ ] MCP path is verified end-to-end if claimed as a live capability in the demo.
- [ ] AgentCore Runtime is verified end-to-end if claimed as a live production component.

### Release quality

- [ ] Review the previously observed `3 high-severity npm audit vulnerabilities`; do not blindly use `npm audit fix --force`.
- [ ] Run final typecheck, lint, tests and production build after all final changes.
- [ ] Run security/reliability release gate.
- [ ] Check secrets are not exposed in source, build artifacts or logs.
- [ ] Confirm final UI has no stale error banner after a successful diagnosis.
- [ ] Verify mobile layout and desktop layout on the final build.

### Submission

- [ ] Capture final golden-path demo evidence.
- [ ] Keep the demo under the official video time limit.
- [ ] Show CockroachDB memory working, not merely a static UI.
- [ ] Show AWS/Bedrock integration clearly.
- [ ] Confirm public GitHub repository and public demo URL.
- [ ] Final submission audit against the official hackathon rules.

---

## 6. Current deployment/reference state

Latest GitHub `main` commit observed while preparing this handoff:

```text
cfc64d9da05998e2ce65123e26181300f2e86979
feat: add production embedding runtime probe
```

Latest Amplify deployment observed by the user in this session:

```text
Deployment 21 — Deployed
Repository: repair-atlas:main
Commit message: ui: label native vector search...
```

Public application:

```text
https://main.d21vkylsbd9nj.amplifyapp.com
```

Health endpoint:

```text
https://main.d21vkylsbd9nj.amplifyapp.com/api/health
```

Embedding probe:

```text
https://main.d21vkylsbd9nj.amplifyapp.com/api/health?probe=embedding
```

---

## 7. Rules for the next engineer / new chat

- Do not restart the project from scratch.
- Do not replace CockroachDB vector memory with another vector database.
- Do not remove the human approval boundary.
- Do not replace real memory retrieval with hard-coded evidence for the final demo.
- Do not declare a capability PASS merely because an environment variable exists.
- Prefer the smallest root-cause fix supported by production evidence.
- After every code/config change: deploy, run the relevant health probe, run the diagnosis, and re-check the full workflow.
- Preserve organization and asset scoping.
- Never expose secrets in logs, UI, GitHub or handoff documents.
- Official AWS/CockroachDB/Anthropic documentation should be checked before changing provider-specific integration behavior.

---

## 8. Bottom line

**The project is far beyond the initial broken state.** Database connectivity, schema, vector storage, embedding persistence, Amplify deployment, health observability, diagnosis fallback/retrieval, approval gating and work-order creation have all been implemented or exercised.

**The final blocker is not “the whole app is broken.”** The critical remaining uncertainty is the fresh production embedding/Bedrock runtime path and then proving the complete learning loop with a second incident.

Once those checks are green, move immediately to final QA and submission packaging rather than continuing architectural changes.
