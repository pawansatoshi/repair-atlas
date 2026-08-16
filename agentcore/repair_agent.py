import json
import os
from bedrock_agentcore.runtime import BedrockAgentCoreApp
import boto3
import psycopg

app = BedrockAgentCoreApp()


def retrieve_memory(asset_id: str, symptom: str):
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return []
    # Runtime receives a precomputed embedding from the application layer in production.
    # This tool intentionally exposes only scoped read operations to the agent.
    with psycopg.connect(db_url, connect_timeout=5) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id,title,summary,outcome FROM repair_memories WHERE organization_id=%s AND asset_id=%s ORDER BY created_at DESC LIMIT 5", (os.environ.get('DEMO_ORG_ID','demo-org'), asset_id))
            return [{'id':r[0],'title':r[1],'summary':r[2],'outcome':r[3]} for r in cur.fetchall()]


def model_reason(prompt: str):
    client = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION','us-east-1'))
    response = client.converse(
        modelId=os.environ['BEDROCK_MODEL_ID'],
        messages=[{'role':'user','content':[{'text':prompt[:12000]}]}],
        inferenceConfig={'maxTokens':700,'temperature':0.2},
    )
    return response['output']['message']['content'][0]['text']


@app.entrypoint
def handler(payload):
    asset_id = str(payload.get('assetId','')).strip()[:100]
    symptom = str(payload.get('symptom','')).strip()[:1000]
    if not asset_id or not symptom:
        return {'error':'assetId and symptom are required'}
    memories = retrieve_memory(asset_id, symptom)
    prompt = f"You are RepairAtlas. Asset: {asset_id}. Symptom: {symptom}. Historical evidence: {json.dumps(memories)}. Give a bounded diagnostic recommendation. Distinguish successful from failed interventions. Never invent measurements or authorize consequential writes."
    recommendation = model_reason(prompt)
    return {'assetId':asset_id,'recommendation':recommendation,'memoryCount':len(memories)}


if __name__ == '__main__':
    app.run()
