import json
import os

from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()


def embed(text: str):
    # Keep heavyweight/native dependencies out of process initialization.
    import boto3

    client = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
    response = client.invoke_model(
        modelId=os.environ.get('BEDROCK_EMBED_MODEL_ID', 'amazon.titan-embed-text-v2:0'),
        contentType='application/json',
        accept='application/json',
        body=json.dumps({'inputText': text[:8000]}),
    )
    data = json.loads(response['body'].read())
    vector = data.get('embedding')
    if not isinstance(vector, list) or len(vector) != 1024:
        raise RuntimeError('Embedding model must return exactly 1024 dimensions')
    return vector


def retrieve_memory(asset_id: str, symptom: str):
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return []

    import psycopg

    vector = embed(f'{asset_id} {symptom}')
    with psycopg.connect(db_url, connect_timeout=5) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id,title,summary,outcome,embedding <=> %s::VECTOR AS distance
                   FROM repair_memories
                   WHERE organization_id=%s AND asset_id=%s AND embedding IS NOT NULL
                   ORDER BY embedding <=> %s::VECTOR
                   LIMIT 5""",
                (
                    json.dumps(vector),
                    os.environ.get('DEMO_ORG_ID', 'demo-org'),
                    asset_id,
                    json.dumps(vector),
                ),
            )
            return [
                {
                    'id': r[0],
                    'title': r[1],
                    'summary': r[2],
                    'outcome': r[3],
                    'distance': float(r[4]),
                }
                for r in cur.fetchall()
            ]


def model_reason(prompt: str):
    import boto3

    client = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
    response = client.converse(
        modelId=os.environ['BEDROCK_MODEL_ID'],
        messages=[{'role': 'user', 'content': [{'text': prompt[:12000]}]}],
        inferenceConfig={'maxTokens': 700, 'temperature': 0.2},
    )
    return response['output']['message']['content'][0]['text']


@app.entrypoint
def handler(payload):
    asset_id = str(payload.get('assetId', '')).strip()[:100]
    symptom = str(payload.get('symptom', '')).strip()[:1000]
    if not asset_id or not symptom:
        return {'error': 'assetId and symptom are required'}

    memories = retrieve_memory(asset_id, symptom)
    prompt = (
        f"You are RepairAtlas. Asset: {asset_id}. Symptom: {symptom}. "
        f"Historical evidence: {json.dumps(memories)}. "
        "Give a bounded diagnostic recommendation. Distinguish successful from failed interventions. "
        "Never invent measurements or authorize consequential writes."
    )
    recommendation = model_reason(prompt)
    return {
        'assetId': asset_id,
        'recommendation': recommendation,
        'memoryCount': len(memories),
        'retrieval': 'cockroachdb-vector',
    }


if __name__ == '__main__':
    app.run()
