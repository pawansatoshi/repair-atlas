# RepairAtlas — Hackathon Roadmap

## Mission

Ship a polished, reliable, judge-readable agentic memory product before the official submission deadline.

**Internal rule:** demo reliability beats feature count.

## Phase 0 — Architecture lock

- [x] Product concept selected
- [x] Product name selected
- [x] Core memory thesis defined
- [x] CockroachDB capabilities selected
- [x] AWS execution direction selected
- [x] Golden demo defined
- [ ] Validate exact current SDK/API paths
- [ ] Validate model availability in deployment region
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

- [ ] Create development database
- [ ] Implement relational schema
- [ ] Add constraints and indexes
- [ ] Add repair-memory vector column
- [ ] Add distributed vector index
- [ ] Seed realistic repair experiences
- [ ] Verify semantic retrieval
- [ ] Verify transactional consistency

## Phase 3 — Agent core

- [ ] Implement agent orchestration
- [ ] Implement asset-state retrieval
- [ ] Implement repair-memory retrieval
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

- [ ] Verify Amazon Bedrock model access
- [ ] Integrate model adapter
- [ ] Configure AgentCore Runtime
- [ ] Configure runtime authentication
- [ ] Configure least-privilege IAM
- [ ] Enable required runtime security settings
- [ ] Configure S3 document storage
- [ ] Deploy agent
- [ ] Verify remote invocation

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
- [ ] Verify semantic retrieval
- [ ] Verify recommendation is evidence-based
- [ ] Verify work-order transaction
- [ ] Verify outcome write
- [ ] Verify memory write
- [ ] Verify second incident retrieves learned memory
- [ ] Capture clean screenshots

## Phase 8 — Security and reliability

- [ ] Secret scan
- [ ] IAM review
- [ ] Database role review
- [ ] MCP permission review
- [ ] Agent tool allowlist review
- [ ] Input validation
- [ ] SQL injection review
- [ ] Error redaction
- [ ] Retry strategy
- [ ] Timeout strategy
- [ ] Idempotency review
- [ ] Audit log review

## Phase 9 — Judge audit

### Agentic Memory

- [ ] Persistent state is obvious
- [ ] Semantic retrieval is real
- [ ] Memory changes after outcome
- [ ] Future behavior uses learned memory

### Technical Implementation

- [ ] CockroachDB is central
- [ ] Vector indexing is meaningful
- [ ] MCP is meaningful
- [ ] AWS is in the real execution path
- [ ] Security is credible

### Real-world Impact

- [ ] User is clearly defined
- [ ] Problem is painful and understandable
- [ ] Agent is genuinely necessary
- [ ] Persistent memory is genuinely necessary

### Product Readiness

- [ ] App feels complete
- [ ] Failures are handled
- [ ] Mobile works
- [ ] Authentication/authorization is credible
- [ ] Auditability exists

### Creativity

- [ ] Not a generic chatbot
- [ ] Not generic RAG
- [ ] Not generic incident response
- [ ] Experience-memory loop is visible

## Phase 10 — Submission package

- [ ] Public GitHub
- [ ] License
- [ ] Complete README
- [ ] Architecture diagram
- [ ] Screenshots
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
