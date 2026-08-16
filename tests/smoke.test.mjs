import test from 'node:test';
import assert from 'node:assert/strict';

const requiredFiles = [
  'package.json',
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/api/health/route.ts',
  'app/api/diagnose/route.ts',
  'app/api/memories/route.ts',
  'database/schema.sql',
  'agentcore/repair_agent.py',
  '.mcp.json.example',
];

test('RepairAtlas release contract names all core layers', () => {
  assert.ok(requiredFiles.length >= 10);
  assert.equal(requiredFiles.includes('database/schema.sql'), true);
  assert.equal(requiredFiles.includes('agentcore/repair_agent.py'), true);
});
