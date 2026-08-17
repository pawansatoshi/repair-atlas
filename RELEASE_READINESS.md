# RepairAtlas — Release Readiness

This document records the current release evidence for the deployed RepairAtlas application. It is an engineering status document, not a claim of completeness.

## Verified production behavior

The deployed application has been manually exercised and verified to:

- connect to CockroachDB Cloud
- use `VECTOR(1024)` repair memory
- retrieve semantically similar repair experiences
- distinguish successful and failed interventions
- use Amazon Bedrock for bounded diagnostic reasoning
- keep consequential work-order creation behind explicit human approval
- persist diagnostic work orders
- record repair outcomes
- complete work orders after an outcome is recorded
- persist repair events and durable repair memory
- retrieve persisted memory again after a page refresh
- expose a read-only evidence view for retrieval, comparison, reasoning, and safety policy

A production health check also reported database, schema, vector-memory, Bedrock, embedding, and MCP readiness during the latest verification session. The health response reported 1,024-dimensional embeddings and full embedding coverage for the tested memory set.

## Database and memory integrity

The production database is the operational system of record for transactional repair state and semantic repair memory.

The tested memory path is:

```text
incident
  → Bedrock embedding
  → CockroachDB VECTOR(1024)
  → similarity retrieval
  → evidence-aware recommendation
  → approved work order
  → repair outcome
  → durable repair memory
```

Do not recreate the production database or rerun migrations without a concrete change requiring it.

Do not create duplicate repair events merely to manufacture retrieval evidence.

## Safety boundary

RepairAtlas does not automatically execute consequential operational writes from model output. Work-order creation requires explicit human approval. Model output is treated as untrusted input and server-side validation remains authoritative.

## AWS status

- AWS Amplify Hosting: deployed production web application verified.
- Amazon Bedrock embeddings: verified in the deployed application.
- Amazon Bedrock reasoning: verified in the deployed application.
- AgentCore runtime: implementation present, but an independent deployed-runtime invocation must be observed before it is described as verified.

## Remaining release checks

1. Independently deploy and invoke the AgentCore runtime if it remains part of the final architecture.
2. Capture final evidence from the deployed application rather than relying on screenshots or documentation alone.
3. Run the repository QA/release gates after any final code or configuration change.
4. Perform a final security and configuration review before public submission.

## Evidence rule

Only observed implementation, runtime, database, or deployment evidence should be marked as verified.

`UNKNOWN != PASS`

Do not describe a planned, configured, or documented capability as a completed runtime capability until it has been independently exercised.
