import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Pool } from 'pg';

const db = process.env.DATABASE_URL;
const model = process.env.BEDROCK_EMBED_MODEL_ID;
if (!db || !model) throw new Error('DATABASE_URL and BEDROCK_EMBED_MODEL_ID are required');

const client = new BedrockRuntimeClient({region: process.env.AWS_REGION || 'us-east-1'});
const pool = new Pool({connectionString: db, ssl: {rejectUnauthorized: true}});

const records = [
  ['PRESS-204','Airflow restriction after extended runtime','Intake obstruction was cleared and filter replaced; overheating resolved without motor replacement.','resolved'],
  ['PRESS-204','Fan replacement did not resolve overheating','A prior fan assembly replacement did not resolve the thermal symptom.','failed'],
  ['PRESS-204','Dust-loaded intake filter','Cleaning the intake path and replacing a saturated filter restored stable operating temperature.','resolved'],
] as const;

async function embedding(text:string){
  const command=new InvokeModelCommand({modelId:model,contentType:'application/json',accept:'application/json',body:JSON.stringify({inputText:text})});
  const response=await client.send(command);
  const data=JSON.parse(new TextDecoder().decode(response.body));
  if(!Array.isArray(data.embedding)) throw new Error('Embedding model returned no embedding');
  return `[${data.embedding.join(',')}]`;
}

for(const [assetId,title,summary,outcome] of records){
  const vector=await embedding(`${assetId} ${title}. ${summary}`);
  await pool.query(`INSERT INTO repair_memories (organization_id,asset_id,title,summary,outcome,embedding) VALUES ($1,$2,$3,$4,$5,$6::VECTOR)`,[process.env.DEMO_ORG_ID || 'demo-org',assetId,title,summary,outcome,vector]);
}
await pool.end();
console.log(`Seeded ${records.length} repair memories into CockroachDB.`);