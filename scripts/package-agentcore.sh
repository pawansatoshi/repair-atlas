#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

rm -f RepairAtlas-AgentCore.zip
rm -rf agentcore/.cli/artifacts

agentcore validate -d .
agentcore package -d . -r RepairAtlas

ZIP="$(find agentcore/.cli -type f -name '*.zip' -print -quit 2>/dev/null || true)"
if [[ -z "$ZIP" ]]; then
  ZIP="$(find . -type f -name '*.zip' -not -path './node_modules/*' -not -path './.git/*' -print | head -n 1)"
fi

if [[ -z "$ZIP" ]]; then
  echo "ERROR: AgentCore package ZIP was not produced."
  exit 1
fi

cp "$ZIP" RepairAtlas-AgentCore.zip
printf '\nREADY: %s\nSIZE: ' "$PWD/RepairAtlas-AgentCore.zip"
du -h RepairAtlas-AgentCore.zip | cut -f1
unzip -t RepairAtlas-AgentCore.zip >/dev/null
echo "ZIP integrity: OK"
