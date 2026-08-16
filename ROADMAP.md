# RepairAtlas — Hackathon Roadmap

## Mission

Ship a polished, reliable, judge-readable agentic memory product before the official submission deadline.

**Internal rule:** demo reliability beats feature count.

> **Progress snapshot — 2026-08-16:** The embedding/persistence backend slice is verified end-to-end for the tested repair memory. The full agentic product loop, MCP path, UI, security/reliability gates, golden demo, and submission package remain open. See `docs/HANDOFF_PROGRESS_2026-08-16.md` for the evidence-based handoff.

**Evidence rule:** `UNKNOWN != PASS`. Never mark a task complete without direct evidence.

## Phase 0 — Architecture lock

- [x] Product concept selected
- [x] Product name selected
- [x] Core memory thesis defined
- [x] CockroachDB capabilities selected
- [x] AWS execution direction selected
- [x] Golden demo defined
- [ ] Validate exact current SDK/API paths
- [x] Validate model availability in deployment region
- [ ] Validate MCP permissions and workflow
- [ ] Finalize schema

## Phase 1 — Repository foundation

- [x] New public repository created
- [x] README established
- [x] Blueprint established
- [x] Roadmap established
- [x] Security baseline established
- [x] Architecture documentation established
- [ ] Application scaffolding
- [ ] Database migrations
- [ ] Environment configuration
- [ ] CI checks

## Phase 2 — CockroachDB foundation

- [x] Create development database / verify reachable database
- [x] Implement relational repair-memory schema
- [x] Add constraints and indexes in the verified repair-memory schema
- [x] Add repair-memory vector column
- [ ] Add/prove distributed vector index usage in the actual retrieval plan
- [ ] Seed realistic repair experiences beyond the current verification record
- [x] Verify semantic retrieval
- [ ] Verify transactional consistency

## Phase 3 — Agent core

- [ ] Implement agent orchestration
- [ ] Implement asset-state retrieval
- [ ] Implement repair-memory retrieval as an agent path
- [ ] Implement document retrieval
- [ ] Implement diagnosis recommendation
- [ ] Implement tool policy
- [ ] Implement approval boundary
- [ ] Implement work-order action
- [ ] Implement outcome capture
- [ ] Implement memory creation
- [ ] Implement memory reuse

## Phase 4 — MCP integration

- [ ] Configure CockroachDB Cloud Managed MCP Server
- [ ] Establish authenticated agent connection
- [ ] Scope permissions
- [ ] Verify read operations
- [ ] Verify controlled write operations
- [ ] Verify denied operations
- [ ] Record auditable agent actions

## Phase 5 — AWS integration

- [x] Verify Amazon Bedrock model access
- [x] Integrate Bedrock Titan embedding adapter in the verified Lambda path
- [ ] Configure AgentCore Runtime
- [ ] Configure runtime authentication
- [ ] Configure least-privilege IAM
- [ ] Enable required runtime security settings
- [ ] Configure S3 document storage if required by the final product path
- [x] Deploy Lambda/API embedding path
- [x] Verify remote invocation of the embedding API
- [ ] Verify remote invocation of the complete agent loop

> **Architecture reconciliation required:** the currently verified runtime path is `API Gateway → Lambda → Bedrock → CockroachDB`. The target architecture names AgentCore Runtime; AgentCore is not marked PASS until directly verified.

## Phase 6 — Product UI

- [ ] Operations dashboard
- [ ] Asset list
- [ ] Asset detail
- [ ] Active work order
- [ ] Memory evidence panel
- [ ] Agent activity panel
- [ ] Approval dialog
- [ ] Repair outcome form
- [ ] Success state
- [ ] Error state
- [ ] Empty state
- [ ] Mobile layout
- [ ] Tablet layout

## Phase 7 — Golden demo

- [ ] Seed PRESS-204 scenario
- [ ] Seed successful historical repair
- [ ] Seed failed historical repair
- [x] Verify semantic retrieval building block
- [ ] Verify recommendation is evidence-based
- [ ] Verify work-order transaction
- [ ] Verify outcome write
- [ ] Verify memory write through the complete workflow
- [ ] Verify second incident retrieves learned memory
- [ ] Capture clean screenshots

## Phase 8 — Security and reliability

- [ ] Secret scan
- [ ] IAM review
- [ ] Database role review
- [ ] MCP permission review
- [ ] Agent tool allowlist review
- [x] Input validation for tested embedding endpoint
- [ ] SQL injection review
- [x] Tested error responses do not expose stack traces
- [ ] Retry strategy
- [ ] Timeout strategy
- [ ] Idempotency review
- [ ] Audit log review
- [ ] Network/provider failure testing
- [ ] Adversarial QA

## Phase 9 — Judge audit

### Agentic Memory

- [ ] Persistent state is obvious
- [x] Semantic retrieval building block is real
- [ ] Memory changes after outcome in the complete workflow
- [ ] Future behavior uses learned memory

### Technical Implementation

- [x] CockroachDB is central to the verified persistence path
- [x] Vector embeddings/retrieval are meaningful in the verified path
- [ ] MCP is meaningful and verified
- [x] AWS is in the verified embedding execution path
- [ ] Security is fully reviewed and credible

### Real-world Impact

- [ ] User is clearly defined
- [ ] Problem is painful and understandable
- [ ] Agent is genuinely necessary
- [ ] Persistent memory is genuinely necessary in the complete loop

### Product Readiness

- [ ] App feels complete
- [x] Tested API failure states are handled
- [ ] Mobile works
- [ ] Authentication/authorization is credible
- [ ] Auditability exists

### Creativity

- [x] Product thesis is not a generic chatbot
- [ ] Not generic RAG in the final implementation
- [ ] Not generic incident response
- [ ] Experience-memory loop is visible in the final demo

## Phase 10 — Submission package

- [x] Public GitHub
- [x] License
- [x] Complete README baseline
- [x] Architecture diagram baseline
- [ ] Final screenshots
- [ ] Live demo URL
- [ ] Public video
- [ ] Video under 3 minutes
- [ ] Project description
- [ ] Technology disclosure
- [ ] Setup instructions
- [ ] Testing instructions
- [ ] Rules/eligibility audit
- [ ] Final Devpost review

## Freeze policy

After the golden demo is reliable:

**No major features.**

Only fix:

- bugs
- broken UX
- security issues
- deployment issues
- documentation gaps
- demo clarity

## Internal milestone order

```text
Architecture
  ↓
Database
  ↓
One complete agent loop
  ↓
MCP
  ↓
AWS deployment
  ↓
UI polish
  ↓
Security
  ↓
Golden demo
  ↓
Judge audit
  ↓
Submission
```
