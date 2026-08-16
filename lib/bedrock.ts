import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getRuntimeEnv } from './env';

const region = getRuntimeEnv('AWS_REGION') || 'us-east-1';
const client = new BedrockRuntimeClient({ region });

export async function embed(text: string): Promise<number[] | undefined> {
  const modelId = getRuntimeEnv('BEDROCK_EMBED_MODEL_ID');
  if (!modelId) return undefined;
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ inputText: text.slice(0, 8000) }),
  });
  const response = await client.send(command);
  const data = JSON.parse(new TextDecoder().decode(response.body));
  return Array.isArray(data.embedding) ? data.embedding.map(Number) : undefined;
}

export async function reason(prompt: string): Promise<string | undefined> {
  const modelId = getRuntimeEnv('BEDROCK_MODEL_ID');
  if (!modelId) return undefined;
  const command = new ConverseCommand({
    modelId,
    messages: [{ role: 'user', content: [{ text: prompt.slice(0, 12000) }] }],
    inferenceConfig: { maxTokens: 700, temperature: 0.2 },
  });
  const response = await client.send(command);
  return response.output?.message?.content?.map(part => part.text || '').join('') || undefined;
}
