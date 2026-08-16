# RepairAtlas on Amazon Bedrock AgentCore

`repair_agent.py` is the bounded runtime agent. It uses Amazon Bedrock to embed the current incident, retrieves scoped repair memories from CockroachDB's vector index, and uses Bedrock reasoning to produce a recommendation. Consequential writes remain outside the autonomous read/reason path and are gated by the web application's approval workflow.

## Local requirements

- Node.js 20+ for the AgentCore CLI
- Python 3.12+
- AWS credentials with least-privilege Bedrock and AgentCore permissions
- `DATABASE_URL`
- `BEDROCK_MODEL_ID`
- `BEDROCK_EMBED_MODEL_ID` (defaults to `amazon.titan-embed-text-v2:0` in the agent)

## Local runtime

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python repair_agent.py
```

## AgentCore deployment

Amazon's current AgentCore CLI scaffolds and deploys the runtime through AWS CDK. The supported workflow is:

```bash
npm install -g @aws/agentcore
agentcore create
agentcore dev
agentcore deploy --plan
agentcore deploy
agentcore status
agentcore invoke --prompt "Diagnose PRESS-204 overheating after extended operation"
```

For a new project, choose a Python agent, Bedrock as the model provider, and the protocol appropriate to the runtime integration. Copy the bounded `repair_agent.py` implementation into the generated agent project and configure its environment variables/IAM role before deployment.

The deployed runtime should have only the permissions it needs for Bedrock invocation and scoped CockroachDB access. Enable AgentCore/CloudWatch observability before the final demo and review runtime logs and traces after deployment.

## Memory contract

The agent retrieves only records matching the configured organization and asset. The vector dimension is fixed at 1024 to match Amazon Titan Text Embeddings V2's default output and the CockroachDB `VECTOR(1024)` column. Similarity ranking is performed by CockroachDB; the model does not invent historical records.

Do not commit credentials, runtime tokens, database passwords, or generated AWS configuration containing secrets.
