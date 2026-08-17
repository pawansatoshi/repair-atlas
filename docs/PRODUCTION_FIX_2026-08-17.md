# RepairAtlas — Production Diagnosis Fix

**Date:** 2026-08-17

## Root cause

The production `/api/health` endpoint reported all infrastructure checks as ready after the Amplify SSR environment bridge was fixed, but the UI still showed `Diagnosis service unavailable` and `Bounded demo` behavior when running the diagnosis workflow.

The diagnosis, work-order, outcome, and MCP API routes were still reading configuration directly from `process.env.*`, while the production runtime compatibility layer had been updated to resolve Amplify-backed runtime configuration through `lib/env.ts`.

This created an inconsistent configuration path:

```text
/api/health       -> runtime env resolver -> production configuration visible
/api/diagnose     -> direct process.env   -> configuration appeared missing
/api/work-orders  -> direct process.env   -> configuration appeared missing
/api/outcomes     -> direct process.env   -> configuration appeared missing
/api/mcp          -> direct process.env   -> configuration appeared missing
```

## Fix

The affected server routes were updated to use `getRuntimeEnv()`:

- `app/api/diagnose/route.ts`
- `app/api/work-orders/route.ts`
- `app/api/outcomes/route.ts`
- `app/api/mcp/route.ts`

This keeps configuration resolution consistent with:

- `lib/env.ts`
- `lib/db.ts`
- `lib/bedrock.ts`
- `/api/health`

No secret values are committed or exposed by the fix.

## Expected production behavior after deployment

The diagnosis path should now execute:

```text
PRESS-204 symptom
  -> Titan embedding
  -> CockroachDB VECTOR retrieval
  -> Claude reasoning
  -> evidence-grounded recommendation
```

The response should report:

```text
mode=bedrock
retrievalMode=cockroachdb-vector
```

The approval path should create a real CockroachDB work order, and the outcome path should persist the repair event and durable vector memory rather than silently falling back to demo mode.

## Current remaining verification

1. Wait for AWS Amplify to deploy the latest `main` commit.
2. Run the live diagnosis flow for `PRESS-204` with `overheating after extended operation`.
3. Verify `mode=bedrock` and `retrievalMode=cockroachdb-vector`.
4. Approve the diagnostic work order.
5. Record the successful repair outcome.
6. Verify the new repair memory is persisted in CockroachDB.
7. Run a second differently-worded overheating incident and prove the new memory is retrieved.
8. Verify Managed MCP tool invocation and AgentCore runtime if retained in the final path.

`UNKNOWN != PASS` — each stage must be evidenced before being marked complete.
