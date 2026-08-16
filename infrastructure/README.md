# Infrastructure

## Deployment target

The agent execution path will run on AWS using Amazon Bedrock AgentCore Runtime.

## Planned components

```text
Web application
    ↓
Application API
    ↓
AgentCore Runtime
    ├── Amazon Bedrock
    ├── Amazon S3
    └── CockroachDB Managed MCP
```

## Deployment principles

- infrastructure should be reproducible
- secrets must be injected at runtime
- IAM permissions must be least privilege
- no long-lived access keys in source
- runtime should use current AWS security requirements
- unnecessary infrastructure should not be deployed

## Environment separation

At minimum:

```text
development
hackathon-demo
```

The demo environment must be deterministic and seeded without exposing credentials.

## Deployment gate

Do not call the deployment complete until:

- remote agent invocation succeeds
- CockroachDB memory retrieval succeeds
- controlled write succeeds
- denied action is rejected
- S3 document retrieval succeeds if enabled
- logs contain no secrets
- the public demo can execute the golden scenario
