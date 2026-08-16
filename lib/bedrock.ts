import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

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
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 700,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt.slice(0, 12000) }],
    }),
  });
  const response = await client.send(command);
  const data = JSON.parse(new TextDecoder().decode(response.body));
  return data?.content?.map((part: {type?:string;text?:string})=>part.type === 'text' ? part.text : '').join('') || undefined;
}