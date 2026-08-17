# RepairAtlas — Release Roadmap

> Evidence rule: `UNKNOWN != PASS`.

The product is now in **release hardening**, not feature-building. The deployed web application already demonstrates the core repair-memory loop. The remaining work is verification, cleanup, and submission evidence.

## Verified

- [x] Public repository and license
- [x] Next.js production application on AWS Amplify
- [x] CockroachDB transactional persistence
- [x] `VECTOR(1024)` repair memory
- [x] semantic repair-memory retrieval
- [x] successful/failed intervention comparison
- [x] Amazon Bedrock embeddings
- [x] Amazon Bedrock reasoning
- [x] approval-gated work-order creation
- [x] transactional repair outcome persistence
- [x] durable memory persistence
- [x] retrieval after refresh
- [x] mobile interaction
- [x] safe API error responses
- [x] source-control secret hygiene checks

## Current blocker

- [ ] Independently deploy and invoke the configured Amazon Bedrock AgentCore runtime

The runtime project is checked in under `app/RepairAtlas/` and configured by `agentcore/agentcore.json`. Do not mark AgentCore verified until a real deployed invocation succeeds and evidence is captured.

## Final release checks

- [ ] Re-run typecheck, lint, tests, and production build after the latest documentation/test cleanup
- [ ] Review production runtime errors and warnings
- [ ] Final IAM and environment-secret review
- [ ] Final CockroachDB role/configuration review
- [ ] Final MCP configuration review
- [ ] Adversarial API checks for malformed, repeated, and unauthorized-style inputs
- [ ] Capture final screenshots/evidence from the deployed application
- [ ] Final submission description and technology disclosure review

## Explicit non-goals for the freeze

Do not add:

- another vector database
- multi-agent complexity
- voice or hardware integrations
- speculative features not required by the challenge
- documentation that claims unverified capabilities

Only fix bugs, security/configuration issues, deployment issues, documentation inconsistencies, and demo clarity issues.

## Release order

```text
AgentCore availability
        ↓
independent runtime invocation
        ↓
full QA/build gates
        ↓
security/configuration review
        ↓
final production evidence
        ↓
submission
```
