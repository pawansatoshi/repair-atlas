# RepairAtlas — Debugging & Verification Log

**Date:** 2026-08-16  
**Purpose:** Preserve the live CloudShell debugging session so future agents can continue from verified evidence instead of repeating work.

## Session status

The repository was cloned into AWS CloudShell and the current application structure was audited. The work below was executed/observed during the same session.

### Verified

- Repository clone succeeded from `pawansatoshi/repair-atlas`.
- Working tree was clean and `main` was up to date with `origin/main` at the start of the audit.
- Existing project structure includes `app/`, `agentcore/`, `database/`, `infrastructure/`, `lib/`, `scripts/`, `templates/`, and release/security documentation.
- Existing automated test suite passed: **4 tests, 4 passed, 0 failed**.
- TypeScript typecheck initially failed only because `tsc` was not installed in the CloudShell dependency set; after `npm install --include=dev`, `tsc --noEmit` completed successfully.
- Next.js production build completed successfully with Next.js 15.5.23.
- The build generated the expected application routes including `/api/diagnose`, `/api/health`, `/api/mcp`, `/api/memories`, `/api/outcomes`, and `/api/work-orders`.
- Deterministic seed initially failed because required environment variables were absent. After exporting `DATABASE_URL` from the configured CockroachDB URL and setting `BEDROCK_EMBED_MODEL_ID=amazon.titan-embed-text-v2:0`, the seed completed successfully:
  - `inserted=3`
  - `skipped=0`
  - `organization=demo-org`
- The previously verified AWS path remains valid: API Gateway → Lambda → Bedrock Titan Text Embeddings V2 → CockroachDB.

## Bugs / environment issues found

### 1. CloudShell local PostgreSQL socket confusion

A direct `psql` command initially attempted the local socket because `COCKROACHDB_URL` was not exported in the CloudShell session. This was an environment/session issue, not a CockroachDB availability failure. The CockroachDB URL was recovered from the Lambda environment and the remote query then succeeded.

### 2. Invalid memory UUID tests

The embedding endpoint correctly rejects malformed UUID values with HTTP 400. A syntactically valid but nonexistent UUID returns HTTP 404. The real seeded UUID is persisted successfully.

### 3. Missing development dependency

`tsc --noEmit` initially returned `tsc: command not found`. Installing development dependencies resolved the local typecheck tool availability.

### 4. CloudShell disk pressure during dependency install

`npm install --include=dev` initially hit `ENOSPC` because the CloudShell home filesystem was full. Inspection showed `node_modules` and npm cache were major consumers. Removing the existing `node_modules` and npm cache reduced pressure enough for the install to complete.

The later install completed and reported **3 high-severity npm audit vulnerabilities**. These are now a release-gate item and must not be ignored before final submission.

### 5. AWS SDK Node.js runtime warning

The build reports that AWS SDK for JavaScript v3 will require Node.js >=22 after the first week of January 2027. Current CloudShell runtime is Node.js 20.20.2. This is not a current build failure, but runtime/version compatibility should be reviewed before final deployment.

## Current evidence state

### PASS

- Repository/application checkout
- Existing test suite (4/4)
- TypeScript typecheck
- Next.js production build
- Deterministic seed execution
- Bedrock Titan embedding generation
- 1024-dimensional vector persistence
- CockroachDB semantic retrieval building block
- Embedding endpoint validation/error handling

### NOT YET PROVEN

- Complete agent orchestration
- Evidence-based diagnosis/recommendation through the real product path
- Human approval boundary through the full workflow
- Work-order transaction through the full agent path
- Repair outcome write through the full workflow
- Memory creation/update after outcome through the full workflow
- Second incident retrieving newly learned memory
- CockroachDB Managed MCP Server end-to-end use
- AgentCore Runtime end-to-end verification
- Production UI readiness
- Full security/reliability gate
- Final golden demo
- Final submission package

## Do not repeat unnecessarily

Do **not** rerun the already-proven embedding persistence tests unless a code/deployment change creates a regression risk. The next engineering effort should move toward the complete agentic memory loop.

## Next execution order

```text
1. Audit current API/agent code against the roadmap
2. Connect real repair-memory retrieval to agent reasoning
3. Implement/verify recommendation evidence
4. Implement explicit approval boundary
5. Implement work-order + outcome writes
6. Persist outcome as durable memory
7. Run a second differently-worded incident and prove learned-memory reuse
8. Verify MCP path and permissions
9. Build/audit UI
10. Run security + reliability gates
11. Capture golden demo evidence
12. Final submission audit
```

## Evidence rule

`UNKNOWN != PASS`.

This log records what was directly observed. It does not claim the project is bug-free or submission-ready.
