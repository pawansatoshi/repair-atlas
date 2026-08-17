# RepairAtlas — Final Human Gate

The repository and CI implementation are prepared. The remaining release decision is based only on observed cloud evidence.

## Verified

- CockroachDB Cloud cluster connection verified manually.
- RepairAtlas schema tables created in CockroachDB.
- `repair_memories` uses `VECTOR(1024)`.
- CockroachDB vector index is present and production retrieval is using cosine distance.
- GitHub repository contains the application, schema, seed, agent, docs, QA gate, and AWS deployment configuration.
- Typecheck, lint, smoke tests, and production build have passed in the project quality gates.
- AWS Amplify production deployment is live and manually exercised.
- Amazon Bedrock embedding and reasoning are working in the deployed web application.
- Real CockroachDB vector retrieval from the deployed application is working.
- Real work-order and repair-outcome persistence from the deployed application is working.
- The completed repair remains retrievable after refresh.
- Final mobile/browser interaction audit of the deployed URL has been exercised.

## Still unverified

- Independent Amazon Bedrock AgentCore runtime deployment/invocation evidence.
- Final three-minute submission video.

## Human Gate 1 — CockroachDB migration

The existing cluster already works. Do not recreate the database or run migrations again unless new evidence requires it.

The production application has already demonstrated vector retrieval using the existing index. Preserve the current working database state.

## Human Gate 2 — AWS

Production Amplify Hosting is connected to the GitHub repository and successfully deployed `main`.

Server-side environment variables/secrets are configured through AWS. Never paste database passwords, AWS credentials, or runtime tokens into GitHub files, screenshots, or the video.

## Human Gate 3 — Seed and memory integrity

Production memory integrity has been exercised through the real product loop. Duplicate repair evidence was also found and the retrieval query now deduplicates identical title/summary/outcome records before ranking.

Do not create additional duplicate repair events merely for testing.

## Human Gate 4 — Real product loop — VERIFIED

Observed on the deployed URL:

1. Diagnosis for a PRESS-204 overheating incident.
2. CockroachDB vector retrieval shown in the memory panel.
3. Successful and failed interventions compared.
4. Bedrock reasoning produced a bounded recommendation.
5. Explicit human approval required before consequential write.
6. Diagnostic work order persisted.
7. Successful repair outcome recorded.
8. Work order became `Completed`.
9. Repair event and durable repair memory persisted.
10. Diagnosis re-run successfully retrieved the persisted operational memory.
11. Page refresh preserved the production retrieval flow and memory.

Representative fresh query used during verification:

```text
PRESS-204 thermal rise during a long production cycle
```

The production UI showed CockroachDB vector retrieval, ranked memories, and cosine distances.

## Human Gate 5 — Production smoke test — VERIFIED

Production health evidence observed during the final verification session included:

```text
status: ok
 database: connected
 tablesReady: true
 vectorMemory: true
 bedrock: true
 embeddings: true
 repairMemoryCount: 5
 embeddedMemoryCount: 5
 embeddingCoverage: 1
 mcp: true
 embeddingProbe.ok: true
 embeddingProbe.dimensions: 1024
```

The actual observed JSON is preserved in the engineering handoff and conversation evidence. The MCP flag indicates configured MCP reachability/configuration; it is not being used as proof of an independent AgentCore runtime invocation.

## Human Gate 6 — AgentCore — PENDING

The bounded agent is implemented in `agentcore/repair_agent.py` and the repository contains the current AgentCore CLI workflow.

AWS documents the AgentCore CLI as the supported path for creating, deploying, checking status, and invoking AgentCore runtimes. citeturn995237search0

Remaining action:

```bash
npm install -g @aws/agentcore
agentcore status
agentcore deploy --plan
agentcore deploy
agentcore status
agentcore invoke --prompt "Diagnose PRESS-204 overheating after extended operation"
```

Retain the actual runtime deployment/status/invocation evidence for the submission. Do not claim AgentCore execution until the invocation has been observed.

## Human Gate 7 — Final evidence

Capture only real evidence:

- public AWS-hosted demo URL
- CockroachDB/vector retrieval evidence
- successful diagnosis
- retrieved memory evidence
- evidence-review panel
- human approval
- persisted work order
- persisted repair outcome
- completed work order
- updated memory
- production health response
- mobile browser interaction
- AgentCore invocation, once independently verified

## Release rule

The **production web application is functionally verified**. Submission is fully complete only after the AgentCore runtime invocation evidence and final three-minute video are secured.

Until those two items are complete, final status remains:

**SUBMISSION-READY WEB LOOP — AGENTCORE/VIDEO GATE PENDING**
