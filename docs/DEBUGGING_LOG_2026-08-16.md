# RepairAtlas — Debugging & Verification Log

**Date:** 2026-08-16  
**Purpose:** Preserve the live CloudShell/AWS debugging session so future agents can continue from verified evidence instead of repeating work.

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
- AWS Amplify successfully completed a production deployment for the `main` branch. Amplify reported **Build completed successfully** and **Deployment complete**, with deployment status **Deployed**.
- Amplify build logs verified the production sequence: dependency install, typecheck, lint, tests, `next build`, static-page generation, build artifact creation, artifact upload, and environment caching.
- Amplify deployment details showed repository `pawansatoshi/repair-atlas`, branch `main`, and an Amplify-hosted branch domain.
- The public Amplify website eventually became reachable after the earlier DNS propagation/accessibility issue; no manual DNS change was made during this debugging session.
- Live production `/api/health` endpoint is reachable.

## Bugs / environment issues found

### 1. CloudShell local PostgreSQL socket confusion

A direct `psql` command initially attempted the local socket because `COCKROACHDB_URL` was not exported in the CloudShell session. This was an environment/session issue, not a CockroachDB availability failure. The CockroachDB URL was recovered from the Lambda environment and the remote query then succeeded.

### 2. Invalid memory UUID tests

The embedding endpoint correctly rejects malformed UUID values with HTTP 400. A syntactically valid but nonexistent UUID returns HTTP 404. The real seeded UUID is persisted successfully.

### 3. Missing development dependency

`tsc --noEmit` initially returned `tsc: command not found`. Installing development dependencies resolved the local typecheck tool availability.

### 4. CloudShell disk pressure during dependency install

`npm install --include=dev` initially hit `ENOSPC` because the CloudShell home filesystem was full. Inspection showed `node_modules` and npm cache were major consumers. Removing the existing `node_modules` and npm cache reduced pressure enough for the install to complete.

The later install completed and reported **3 high-severity npm audit vulnerabilities**. These are now a release-gate item and must not be ignored before final submission. Do not blindly run `npm audit fix --force` before reviewing the dependency graph because it can introduce breaking upgrades.

### 5. AWS SDK Node.js runtime warning

The build reports that AWS SDK for JavaScript v3 will require Node.js >=22 after the first week of January 2027. Current CloudShell runtime is Node.js 20.20.2. This is not a current build failure, but runtime/version compatibility should be reviewed before final deployment.

### 6. Git author identity was initially unset

The first commit attempt failed with `Author identity unknown` because the CloudShell Git configuration did not contain a user name/email. A repository-local Git identity was then configured and the metadata commit succeeded. No credential was committed.

### 7. GitHub HTTPS password authentication failed

Initial `git push` attempts using a GitHub username/password failed because GitHub no longer accepts account passwords for Git operations over HTTPS. A repository-scoped fine-grained personal access token was then used successfully for the push. The token itself is not stored in the repository or documentation.

### 8. Git history was behind remote before synchronization

An initial push was rejected as non-fast-forward because the remote `main` branch contained commits not present locally. `git pull --rebase origin main` successfully reconciled the history, after which the push completed successfully.

### 9. Amplify environment-variable validation rejected an AWS-prefixed variable

During initial Amplify configuration, the console reported: `Environment variables cannot start with the reserved prefix "AWS"`. `AWS_REGION` was removed from the Amplify environment-variable set because Amplify reserves the `AWS` prefix.

### 10. Amplify public branch DNS propagation/access issue

Amplify initially reported the deployment as **Deployed** while the displayed branch domain returned `DNS_PROBE_POSSIBLE`. The domain later became reachable without a manual DNS change during this session. Treat the earlier DNS failure as a transient propagation/accessibility finding, not an application-build failure.

### 11. Amplify Next.js SSR environment variables were only configured at the Amplify app level

The live endpoint:

`/api/health`

returned:

```json
{"status":"ok","database":"not_configured","tablesReady":false,"vectorMemory":false,"bedrock":false,"embeddings":false,"mcp":false}
```

The user confirmed that `DATABASE_URL` was saved in Amplify app environment variables with the real CockroachDB connection string and All branches selected, and the app was redeployed. Despite this, `process.env.DATABASE_URL` was unavailable to the Next.js server runtime.

AWS's current Amplify documentation explicitly states that app environment variables are available to the build, but Next.js server-side runtime does not receive them by default. AWS recommends bridging selected variables into a `.env.production` file during the build so the deployed Next.js server can access them. citeturn482149search0turn482149search1

### 12. Runtime environment compatibility hardening

A `lib/env.ts` helper was added to resolve configuration from either direct `process.env.*` or Amplify Gen 1-style `process.env.secrets` JSON. `lib/db.ts`, `lib/bedrock.ts`, and `/api/health` were updated to use the helper. The health response now exposes only safe configuration-presence booleans and a non-secret runtime configuration source marker.

### 13. Amplify SSR environment bridge patch

`amplify.yml` was updated so that, immediately before `next build`, the build environment copies only the required server-side configuration variables into `.env.production`:

- `DATABASE_URL`
- `DATABASE_SSL`
- `DB_POOL_MAX`
- `DEMO_ORG_ID`
- `BEDROCK_MODEL_ID`
- `BEDROCK_EMBED_MODEL_ID`
- `COCKROACH_MCP_URL`

This follows AWS's documented SSR approach for making selected Amplify build variables available to the Next.js server runtime. citeturn482149search0

**Security note:** AWS warns that credentials written into `.env.production` can be present in deployment artifacts and therefore should be handled carefully. This is a temporary hackathon-path compatibility fix; before final production hardening, move sensitive database/MCP credentials to the appropriate secret mechanism rather than broadly exposing them in build artifacts. citeturn482149search0

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
- Amplify production build
- Amplify artifact creation/upload
- Amplify deployment completion
- Public Amplify website accessibility
- Live `/api/health` route accessibility

### NOT YET PROVEN

- Production runtime availability of `DATABASE_URL` after the new SSR environment bridge deployment
- Production CockroachDB connectivity from Amplify
- Production table/vector readiness
- Real Bedrock reasoning from the Amplify runtime
- Real Bedrock embedding generation from the Amplify runtime
- Complete agent orchestration
- Evidence-based diagnosis/recommendation through the real product path
- Human approval boundary through the full workflow
- Work-order transaction through the full agent path
- Repair outcome write through the full workflow
- Memory creation/update after outcome through the full workflow
- Second incident retrieving newly learned memory
- CockroachDB Managed MCP Server end-to-end use
- AgentCore Runtime end-to-end verification
- Full security/reliability gate
- Final golden demo
- Final submission package

## Do not repeat unnecessarily

Do **not** rerun the already-proven embedding persistence tests unless a code/deployment change creates a regression risk. The immediate engineering effort is the Amplify production runtime configuration path; once that is green, move directly to the complete agentic memory loop.

## Next execution order

```text
1. Wait for Amplify to deploy the SSR environment bridge patch
2. Re-run live /api/health
3. Prove DATABASE_URL reaches the Amplify runtime without exposing its value
4. Verify CockroachDB connection, tables, and vector index
5. Verify Bedrock runtime configuration and live reasoning/embedding calls
6. Verify CockroachDB MCP path and permissions
7. Verify AgentCore Runtime if retained in the architecture
8. Connect real repair-memory retrieval to agent reasoning
9. Verify explicit approval boundary
10. Verify work-order + outcome writes
11. Persist outcome as durable memory
12. Run a second differently-worded incident and prove learned-memory reuse
13. Run security + reliability gates
14. Capture golden demo evidence
15. Final submission audit
```

## Evidence rule

`UNKNOWN != PASS`.

This log records what was directly observed. It does not claim the project is bug-free or submission-ready.
