import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const requiredFiles = [
  'package.json',
  'amplify.yml',
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/api/health/route.ts',
  'app/api/diagnose/route.ts',
  'app/api/memories/route.ts',
  'app/api/work-orders/route.ts',
  'app/api/outcomes/route.ts',
  'database/schema.sql',
  'agentcore/repair_agent.py',
  '.mcp.json.example',
];

test('RepairAtlas release contract names all core layers', () => {
  assert.ok(requiredFiles.length >= 10);
  for (const file of requiredFiles) assert.doesNotThrow(() => readFileSync(file, 'utf8'));
});

test('schema keeps semantic memory and operational state together', () => {
  const schema = readFileSync('database/schema.sql', 'utf8');
  assert.match(schema, /repair_memories[\s\S]*VECTOR\(1024\)/i);
  assert.match(schema, /CREATE VECTOR INDEX/i);
  assert.match(schema, /repair_events/i);
  assert.match(schema, /audit_events/i);
});

test('consequential write path requires explicit approval', () => {
  const route = readFileSync('app/api/work-orders/route.ts', 'utf8');
  assert.match(route, /approved:\s*z\.literal\(true\)/);
  assert.match(route, /ASSET_NOT_FOUND/);
  assert.match(route, /audit_events/);
});

test('source contains no obvious credential literals', () => {
  const files = ['.env.example', '.mcp.json.example', 'app/api/mcp/route.ts'];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /sk-[A-Za-z0-9]{20,}/);
    assert.doesNotMatch(content, /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/);
  }
});
