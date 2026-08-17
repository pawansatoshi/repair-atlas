import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getRuntimeEnv } from './env';

const reasoningRegion = getRuntimeEnv('BEDROCK_REGION') || getRuntimeEnv('AWS_REGION') || 'us-east-1';
const embeddingRegion = getRuntimeEnv('BEDROCK_EMBED_REGION') || getRuntimeEnv('AWS_REGION') || 'us-east-1';

const reasoningClient = new BedrockRuntimeClient({ region: reasoningRegion });
const embeddingClient = new BedrockRuntimeClient({ region: embeddingRegion });

function parseEmbedding(payload: unknown): number[] | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = payload as Record<string, unknown>;
  const candidates = [
    value.embedding,
    (value.data as Record<string, unknown> | undefined)?.embedding,
    value.vector,
    (value.result as Record<string, unknown> | undefined)?.embedding,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length === 1024) {
      const vector = candidate.map(Number);
      if (vector.every(Number.isFinite)) return vector;
    }
  }
  return undefined;
}

async function gatewayEmbedding(text: string, endpoint: string): Promise<number[] | undefined> {
  const bodyCandidates = [
    { inputText: text.slice(0, 8000), dimensions: 1024, normalize: true },
    { inputText: text.slice(0, 8000) },
    { text: text.slice(0, 8000) },
  ];

  for (const body of bodyCandidates) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      if (!response.ok) continue;
      const data = await response.json();
      const vector = parseEmbedding(data);
      if (vector) return vector;
    } catch (error) {
      console.error('embedding gateway failed', error instanceof Error ? error.message : 'unknown');
    }
  }
  return undefined;
}

export async function embed(text: string): Promise<number[] | undefined> {
  const modelId = getRuntimeEnv('BEDROCK_EMBED_MODEL_ID');
  if (!modelId) return undefined;

  // Prefer the verified RepairAtlas embedding gateway. This keeps the
  // production app independent of the Amplify compute role's Bedrock
  // permissions while still using the same Titan V2 1024-dim embedding model.
  const endpoint = getRuntimeEnv('REPAIR_ATLAS_EMBEDDING_API_URL');
  if (endpoint) {
    const gatewayVector = await gatewayEmbedding(text, endpoint);
    if (gatewayVector) return gatewayVector;
  }

  // Direct Bedrock fallback for environments where the SSR compute role is
  // explicitly granted bedrock:InvokeModel in the embedding region.
  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ inputText: text.slice(0, 8000), dimensions: 1024, normalize: true }),
    });
    const response = await embeddingClient.send(command);
    const data = JSON.parse(new TextDecoder().decode(response.body));
    const vector = parseEmbedding(data);
    if (vector) return vector;
  } catch (error) {
    console.error('bedrock embedding failed', error instanceof Error ? error.message : 'unknown');
  }

  return undefined;
}

export async function reason(prompt: string): Promise<string | undefined> {
  const modelId = getRuntimeEnv('BEDROCK_MODEL_ID');
  if (!modelId) return undefined;

  try {
    const command = new ConverseCommand({
      modelId,
      messages: [{ role: 'user', content: [{ text: prompt.slice(0, 12000) }] }],
      inferenceConfig: { maxTokens: 700, temperature: 0.2 },
    });
    const response = await reasoningClient.send(command);
    return response.output?.message?.content?.map(part => part.text || '').join('') || undefined;
  } catch (error) {
    console.error('bedrock reasoning failed', error instanceof Error ? error.message : 'unknown');
    return undefined;
  }
}
