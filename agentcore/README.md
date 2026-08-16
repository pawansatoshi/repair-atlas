# RepairAtlas on Amazon Bedrock AgentCore

`repair_agent.py` is the bounded runtime agent. It reads scoped repair memory from CockroachDB and uses Amazon Bedrock for recommendation generation. Consequential writes remain outside the autonomous read/reason path and are gated by the application approval workflow.

## Local requirements

- Python 3.10+
- AWS credentials with least-privilege Bedrock permissions
- `DATABASE_URL`
- `BEDROCK_MODEL_ID`

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python repair_agent.py
```

## AgentCore deployment

Use the current AgentCore CLI workflow:

```bash
npm install -g @aws/agentcore
agentcore create --protocol MCP
agentcore deploy
```

For the current AWS runtime contract, the runtime uses a containerized agent and supports MCP/HTTP invocation. Keep the runtime IAM role narrowly scoped to the required Bedrock and database resources.

Do not commit credentials or runtime tokens.
