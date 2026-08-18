# RepairAtlas — Product & Architecture

## Product thesis

RepairAtlas turns completed repairs into durable operational memory that improves the next repair.

It is an operations console, not a chat-history demo. The core loop is:

```text
incident
  ↓
asset-scoped memory retrieval
  ↓
success / failure comparison
  ↓
bounded recommendation
  ↓
human approval
  ↓
work-order
  ↓
repair outcome
  ↓
durable repair memory
  ↓
future incident
```

## Current implementation

### Web application

- Next.js 15 + React 19
- AWS Amplify Hosting
- server-side API routes
- mobile/tablet/desktop operations UI

### Reasoning and embeddings

- Amazon Bedrock for diagnostic reasoning
- Amazon Titan Text Embeddings V2 for 1,024-dimensional embeddings
- model output is treated as untrusted input
- recommendations are bounded by retrieved evidence

### Operational system of record

CockroachDB Cloud stores:

- organizations
- assets
- work orders
- repair events
- repair memories
- agent sessions/actions
- audit events

Repair memories use `VECTOR(1024)` and CockroachDB vector indexing. Retrieval is scoped by the configured organization and asset.

### AgentCore

The AgentCore CLI project is under `app/RepairAtlas/`.

- entrypoint: `app/RepairAtlas/main.py`
- Python: 3.14
- runtime configuration: `agentcore/agentcore.json`
- CodeZip location: `app/RepairAtlas/`
- protocol: HTTP
- network mode: PUBLIC

The runtime implementation performs embedding, CockroachDB vector retrieval, and bounded Bedrock reasoning. **Independent deployed AgentCore invocation is still pending and is not described as verified.**

## Golden scenario

`PRESS-204` reports overheating after extended operation.

The application retrieves previous repair experiences, including successful airflow/filter interventions and a failed fan replacement. The recommendation favors inspection of airflow before motor replacement. Creating the diagnostic work order requires explicit approval. The technician outcome is persisted as both an operational repair event and durable semantic memory.

## Safety boundary

Model output cannot directly create a consequential work order. The web API requires `approved: true`, validates the asset against the configured organization, performs the write transactionally, and records an audit event.

Repair outcomes likewise require an existing open/staged work order and are written transactionally with the repair event and memory.

## Scope and authentication

The current deployment uses a server-configured organization scope (`DEMO_ORG_ID`) rather than end-user authentication. This is intentional for the demonstrated MVP but means it is **not yet a general multi-tenant production identity system**.

Production hardening would add an identity provider, authenticated sessions, role-based authorization, stronger tenant isolation, and corresponding adversarial tests.

## MCP

CockroachDB Managed MCP configuration is supported as a configured/reachability path. It is not presented as an independently verified autonomous agent write path unless direct runtime evidence exists.

## Evidence policy

Only observed behavior is marked verified. Planned architecture, configuration, source code, or documentation does not count as runtime evidence.

`UNKNOWN != PASS`

## Release boundary

Verified in the deployed web application:

- CockroachDB persistence
- vector retrieval
- Bedrock reasoning
- successful/failed intervention comparison
- approval-gated work-order creation
- repair-outcome persistence
- durable memory persistence
- refresh persistence
- mobile interaction

Pending:

1. independent AgentCore deployment/invocation evidence
2. final security/configuration review
3. final release verification

No additional architecture should be added unless it directly improves one of those release items.
