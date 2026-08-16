# AWS Bedrock Embeddings Integration

## Status

Verified working on 2026-08-16.

The production-tested embedding path is:

```text
Repair Atlas client
  -> API Gateway HTTP API
  -> AWS Lambda: repair-atlas-bedrock
  -> Amazon Bedrock: amazon.titan-embed-text-v2:0
  -> 1024-dimensional normalized embedding
```

## AWS resources

| Component | Value |
|---|---|
| AWS region | `eu-north-1` (Europe/Stockholm) |
| Lambda | `repair-atlas-bedrock` |
| Runtime | Node.js 24.x |
| Handler | `index.handler` |
| Architecture | x86_64 |
| Bedrock embedding model | `amazon.titan-embed-text-v2:0` |
| Embedding dimensions | `1024` |
| Normalization | `true` |
| API Gateway | `repair-atlas-api` |
| API protocol | HTTP API / IPv4 |
| Route | `POST /embed` |
| Stage | `$default` (auto-deploy enabled) |
| API endpoint | `https://q8099op9f9.execute-api.eu-north-1.amazonaws.com/embed` |

## Verified API contract

Request:

```json
{
  "text": "A motor is overheating and needs inspection",
  "dimensions": 1024,
  "normalize": true
}
```

Successful response is HTTP `200` and contains an embedding vector. The integration was verified from AWS CloudShell with a real HTTP request.

## Important security rules

- **Never commit AWS access keys, secret keys, session tokens, private keys, database credentials, or other secrets.**
- Keep real environment values in `.env` or the deployment platform's secret manager. `.env` is ignored by Git.
- The API endpoint above is infrastructure configuration, not a credential.
- The current HTTP API route is intentionally documented as an integration endpoint; add authentication/throttling before exposing it broadly or treating it as an unrestricted public production API.
- Do not put IAM user credentials or Bedrock credentials into Lambda source code. Lambda should use its execution role.

## Test command

```bash
curl -X POST "https://q8099op9f9.execute-api.eu-north-1.amazonaws.com/embed" \
  -H "Content-Type: application/json" \
  -d '{"text":"A motor is overheating and needs inspection","dimensions":1024,"normalize":true}'
```

Expected result: HTTP `200` with an embedding vector.

## Known troubleshooting history

### 1. Lambda initially returned `Operation not allowed`

Cause: the Lambda execution role did not yet allow the required Bedrock model invocation action/resource.

Resolution: the Lambda execution-role policy was corrected to allow `bedrock:InvokeModel` for the embedding model, after which the Lambda test succeeded.

### 2. CloudShell direct Bedrock test initially failed with `Invalid base64`

Cause: the CLI request used a JSON object directly where the AWS CLI expected the request body in the required encoded/binary form.

The Lambda implementation is the canonical application path, and the Lambda/API Gateway test is the verified path.

### 3. CloudWatch log group

The Lambda log group is:

```text
/aws/lambda/repair-atlas-bedrock
```

CloudWatch confirmed a log stream and successful invocation after the IAM fix.

## Next integration milestone

The next backend step is to send these 1024-dimensional embeddings into CockroachDB and use vector similarity search for Repair Atlas retrieval.

Target flow:

```text
repair text
  -> POST /embed
  -> 1024-d embedding
  -> CockroachDB VECTOR column
  -> vector similarity search
  -> relevant repair knowledge
  -> repair recommendation
```

## What is deliberately NOT stored here

- AWS access keys or secret keys
- AWS session tokens
- CockroachDB passwords/connection strings
- GitHub tokens
- API keys
- Private IAM credentials
- Any `.env` contents

This file is safe to keep in the public repository because it contains only non-secret architecture and integration configuration.