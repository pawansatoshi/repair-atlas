import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const region = process.env.AWS_REGION || 'us-east-1';
const client = new BedrockRuntimeClient({ region });

export async function embed(text: string): Promise<number[] | undefined> {
  if (!process.env.BEDROCK_EMBED_MODEL_ID) return undefined;
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_EMBED_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ inputText: text.slice(0, 8000) }),
  });
  const response = await client.send(command);
  const data = JSON.parse(new TextDecoder().decode(response.body));
  return Array.isArray(data.embedding) ? data.embedding.map(Number) : undefined;
}

export async function reason(prompt: string): Promise<string | undefined> {
  if (!process.env.BEDROCK_MODEL_ID) return undefined;
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt.slice(0, 12000) }] }],
    inferenceConfig: { maxTokens: 700, temperature: 0.2 },
  });
  const response = await client.send(command);
  return response.output?.message?.content?.map(part => part.text || '').join('') || undefined;
}