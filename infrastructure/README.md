# Infrastructure

## Deployment target

RepairAtlas runs its production application and agent execution path on AWS while keeping CockroachDB Cloud as the transactional source of truth and persistent semantic memory layer.

## Final deployment path

```text
GitHub main
    ↓
AWS Amplify Hosting
    ↓
Next.js application + server APIs
    ↓
Amazon Bedrock AgentCore Runtime
    ├── Amazon Bedrock reasoning
    ├── Amazon Titan Text Embeddings V2
    └── CockroachDB Managed MCP
             ↓
       CockroachDB Cloud
       ├── Transactional state
       ├── Repair events
       ├── Audit events
       └── VECTOR(1024) repair memory
```

## Component responsibilities

### AWS Amplify Hosting

Hosts the public Next.js application and provides the production AWS deployment surface required by the hackathon.

### Amazon Bedrock AgentCore Runtime

Runs the bounded repair agent. The runtime is responsible for agent execution and runtime observability, not for storing application state.

### Amazon Bedrock

Provides model inference for bounded diagnosis and recommendation.

### Amazon Titan Text Embeddings V2

Generates 1,024-dimensional embeddings for incidents and repair memories. The vectors are stored and searched in CockroachDB.

### CockroachDB Managed MCP Server

Provides the governed agent/database interface. Database operations remain organization- and asset-scoped.

### CockroachDB Cloud

Remains the authoritative persistence layer for operational state, repair events, audit events, work orders, and semantic repair memory.

## Deliberate infrastructure constraint

Do not deploy EC2, RDS, DynamoDB, Lambda, S3, or other AWS infrastructure merely to increase AWS service count. Add another service only when it has a clear product requirement and strengthens the end-to-end demo.

The project has AWS promotional credits, but credit consumption is not a design objective. Cloud resources should remain minimal and cost-controlled.

## Security principles

- infrastructure should be reproducible
- secrets must be injected at runtime
- IAM permissions must be least privilege
- no long-lived access keys in source
- database credentials must never reach the browser
- organization and asset authorization must be enforced server-side
- model output is untrusted input
- consequential writes require explicit human approval
- logs must not contain credentials or sensitive secrets

## Environment separation

At minimum:

```text
development
hackathon-demo
```

The demo environment must be deterministic and seeded without exposing credentials.

## Deployment gate

Do not call the deployment complete until all of the following are verified:

- public Amplify deployment succeeds
- remote AgentCore invocation succeeds
- Bedrock reasoning succeeds
- Titan embedding generation succeeds
- CockroachDB memory retrieval succeeds through the intended path
- organization/asset scoping is enforced
- approved controlled write succeeds
- denied consequential action is rejected and audited
- repair outcome persists as a repair event and durable memory
- a subsequent diagnosis can retrieve that persisted memory
- logs contain no secrets
- the public demo can execute the golden scenario end to end
