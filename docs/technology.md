# RepairAtlas — Technology Decisions

## CockroachDB

### Distributed Vector Indexing

RepairAtlas uses CockroachDB vector capabilities to store and retrieve semantic representations of repair experiences.

The purpose is not generic RAG. The vector represents a normalized operational experience linked to an asset, repair event, outcome, and timestamp.

Official reference:
https://www.cockroachlabs.com/blog/distributed-vector-indexing-cockroachdb/

### Managed MCP Server

RepairAtlas plans to use the CockroachDB Cloud Managed MCP Server as the governed MCP interface between the agent and CockroachDB.

Official endpoint:
https://cockroachlabs.cloud/mcp

The implementation will use scoped permissions and will not grant the agent unrestricted administrative database access.

## AWS

### Amazon Bedrock

Bedrock provides model inference for diagnosis, memory interpretation, and bounded action planning.

The model is not treated as the source of truth. CockroachDB remains authoritative for operational state and persistent repair memory.

### Amazon Bedrock AgentCore Runtime

AgentCore Runtime is the preferred execution environment for the new implementation. AWS documents it as a secure, serverless, purpose-built hosting environment for AI agents and tools. It is framework-agnostic, supports MCP, provides session isolation, and includes agent-oriented observability.

Official reference:
https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html

### Amazon S3

S3 stores document-oriented knowledge and artifacts such as:

- equipment manuals
- maintenance guides
- repair reports
- generated service artifacts

The application should only retrieve documents relevant to the current task.

## Important AWS architecture update

Do **not** build new functionality around Amazon Bedrock Agents Classic. AWS states that Bedrock Agents Classic stopped accepting new customers on July 30, 2026 and recommends Amazon Bedrock AgentCore for similar capabilities.

Official reference:
https://docs.aws.amazon.com/bedrock/latest/userguide/agents-how.html

## Runtime security

AgentCore security configuration should follow AWS guidance:

- least-privilege IAM
- scoped `aws:SourceArn` / `aws:SourceAccount` trust conditions where applicable
- MMDSv2 enabled for current runtime requirements
- non-root containers
- secure credential management
- separation of delegated and autonomous credentials
- audit and monitoring

Official reference:
https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html

## Model abstraction

The application should not hard-code a single model into business logic.

Use configuration such as:

```text
AWS_REGION
BEDROCK_MODEL_ID
```

and isolate model invocation behind an adapter so the deployment model can be changed without redesigning the agent.

## Network decision

The first deployment should favor the lowest-risk architecture that can be securely demonstrated within the hackathon timeframe. Private VPC connectivity is not required unless the chosen deployment path needs private resources.

AWS documents AgentCore VPC connectivity for secure access to private resources, but a VPC/NAT architecture can introduce additional operational complexity and cost. We should not add it solely for appearance.

## Cost discipline

Use the smallest practical development resources and clean up unused infrastructure. Avoid persistent expensive services that do not materially improve the submission.
