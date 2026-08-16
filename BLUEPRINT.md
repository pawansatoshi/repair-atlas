# RepairAtlas — Master Blueprint

> **Implementation status snapshot — 2026-08-16:** The Bedrock → Lambda/API → CockroachDB embedding/persistence slice is verified for the tested repair memory, including 1024-dimensional storage, semantic retrieval, UUID validation, required-field validation, and safe nonexistent-memory handling. The complete agentic memory loop is **not yet verified**. Read `docs/HANDOFF_PROGRESS_2026-08-16.md` before continuing implementation.

## 1. Product thesis

**RepairAtlas turns every completed repair into institutional memory that improves the next repair.**

The product is not a chatbot with chat history. It is an operational agent that combines current asset state, historical repair experiences, semantic retrieval, controlled actions, and outcome learning.

## 2. Winning equation

```text
Real field-service problem
        +
Agent genuinely required
        +
Persistent experience memory genuinely required
        +
CockroachDB as system of record + vector memory
        +
AWS as real execution infrastructure
        +
Safe, observable actions
        +
A memorable before/after demo
        =
Strong hackathon submission
```

## 3. Target user

Primary user: field-service technician or maintenance operator.

Initial vertical: industrial equipment repair.

Expansion opportunities: solar maintenance, HVAC, telecom infrastructure, generators, pumps, manufacturing equipment, utilities, and fleet operations.

## 4. Problem

Operational knowledge is fragmented across work orders, technician notes, manuals, memory, and individual experience. A new incident often forces a technician to repeat diagnostic work that another technician already completed.

The highest-value information is not merely a document. It is an **experience**:

- symptoms
- diagnosis
- attempted intervention
- failed intervention
- successful intervention
- parts used
- observed conditions
- final outcome

## 5. Agent loop

```text
1. Observe current failure
2. Identify asset and current state
3. Retrieve relevant repair experiences
4. Retrieve supporting documentation
5. Compare previous outcomes
6. Produce a bounded diagnostic recommendation
7. Check action policy
8. Request approval where required
9. Execute permitted workflow action
10. Capture technician outcome
11. Convert outcome into durable memory
12. Reuse that memory on future incidents
```

## 6. Agent tool contract

### Read tools

- `get_asset`
- `get_asset_history`
- `get_open_work_orders`
- `search_repair_memory`
- `get_parts`
- `search_documents`

### Controlled write tools

- `create_work_order`
- `update_work_order`
- `record_repair_outcome`
- `create_repair_memory`

### Forbidden operations

- delete repair history
- alter audit history
- schema modification
- credential access
- unrestricted administrative SQL

## 7. Memory model

### Operational memory

Current transactional state.

Examples: asset status, work-order status, assigned technician, inventory state.

### Episodic memory

A concrete experience.

Examples: symptoms, diagnosis, action, outcome, technician observation.

### Semantic memory

Vectorized representations of repair experiences for similarity retrieval.

### Learned memory

Structured conclusions derived from outcomes, especially successful and failed interventions.

### Audit memory

Immutable record of agent actions, approvals, tool calls, results, and timestamps.

## 8. Proposed database model

```text
organizations
users
sites
assets
asset_events
work_orders
diagnostic_steps
repair_events
parts
repair_parts
repair_memories
documents
agent_sessions
agent_actions
audit_events
```

### `assets`

Current identity and state of physical equipment.

### `asset_events`

Chronological operational events and symptoms.

### `work_orders`

Transactional lifecycle of a service job.

### `repair_events`

What a technician actually did and what happened afterward.

### `repair_memories`

Normalized experience summary plus embedding, outcome, confidence, and source event.

## 9. Vector strategy

Use CockroachDB vector capabilities for semantic retrieval while preserving relational scope.

The preferred retrieval strategy is:

```text
current asset
   ↓
asset/model/site relevance filter
   ↓
semantic similarity
   ↓
outcome-aware ranking
   ↓
small evidence set
   ↓
agent reasoning
```

Do not introduce Pinecone, Weaviate, Qdrant, Chroma, or another vector database unless a future requirement proves CockroachDB insufficient.

**Verified implementation slice:** `repair_memories.embedding` is `VECTOR(1024)`, Titan Text Embeddings V2 returns 1024 dimensions, a real memory has been persisted, and CockroachDB vector-distance retrieval returns the expected repair memory.

## 10. Outcome-aware memory

A critical differentiator is remembering both successful and unsuccessful attempts.

Example:

```text
Attempt A: replace fan
Outcome: failed

Attempt B: clean intake + replace filter
Outcome: resolved
```

A future agent should not merely retrieve both records. It should understand that B has stronger historical evidence for the observed pattern and that A should not be repeated without new evidence.

## 11. AWS architecture

### Amazon Bedrock

Model inference and reasoning.

### Amazon Bedrock AgentCore Runtime

Production agent execution, session isolation, authentication/authorization integration, observability, and runtime scaling.

### Amazon S3

Service manuals, equipment documentation, maintenance artifacts, and generated reports.

The architecture should not use AWS as a compliance checkbox. Each AWS component has a visible job in the execution path.

**Current verified path:** API Gateway → Lambda (`repair-atlas-bedrock`) → Amazon Bedrock Titan Text Embeddings V2 → CockroachDB. AgentCore Runtime and S3 are target architecture components and are not marked verified until directly exercised.

## 12. CockroachDB architecture

### Capability 1 — Distributed Vector Indexing

Provides semantic retrieval over repair experiences.

### Capability 2 — Managed MCP Server

Provides a governed MCP interface for agent/database interaction.

The agent should have narrowly scoped permissions and should not receive unrestricted administrative access.

**Current verification:** CockroachDB persistence and vector retrieval are proven for the tested repair-memory path. Managed MCP integration remains open.

## 13. Security model

```text
Technician
    ↓
Application authentication
    ↓
Agent session
    ↓
Tool policy
    ↓
MCP authorization
    ↓
CockroachDB role permissions
    ↓
Transactional operation
    ↓
Audit event
```

Consequential operations require approval. Read operations can be automatic where policy allows.

## 14. UI model

The primary interface is an operations console, not a chat-only UI.

### Screen areas

1. Asset/work-order navigation
2. Active diagnostic workflow
3. Retrieved repair memory
4. Agent activity and action status
5. Approval controls
6. Repair outcome capture

The UI should make the memory loop visually obvious.

## 15. Golden scenario

### Incident 1

`PRESS-204` reports overheating after extended operation.

### Retrieval

The agent finds previous semantically similar cases.

### Comparison

One previous fan replacement failed. One airflow intervention succeeded.

### Decision

Agent recommends checking airflow before replacing the motor.

### Action

Technician approves creation of a diagnostic work order.

### Outcome

Intake obstruction is confirmed and the repair succeeds.

### Learning

The successful repair becomes a new semantic experience.

### Incident 2

The same asset reports a differently worded overheating/airflow symptom.

### Payoff

The agent retrieves the prior successful experience and uses it in the new recommendation.

## 16. Definition of done for the MVP

The MVP is complete only when the following closed loop works against real persistence:

```text
failure
→ retrieve memory
→ agent recommendation
→ approval
→ work-order write
→ repair outcome
→ memory write
→ semantic retrieval on later failure
```

Hard-coded demo results do not count.

**Current status:** the persistence/embedding/retrieval building block is verified, but the complete closed loop above is still open.

## 17. Engineering quality gates

### Functional

- [ ] fresh setup works
- [x] database connection works for the verified Lambda path
- [x] vector retrieval works for the tested repair-memory path
- [ ] agent works end-to-end
- [ ] MCP path works
- [x] memory persists for the tested record
- [ ] memory updates after outcome in the complete workflow
- [x] AWS execution works for the verified embedding path
- [x] tested API failure states are handled

### Security

- [ ] no secrets in Git
- [ ] least privilege
- [ ] scoped DB credentials
- [ ] constrained tools
- [ ] approval boundaries
- [ ] safe logging

### UX

- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] no overflow
- [ ] keyboard/touch usability

### Reliability

- [ ] model timeout handling
- [ ] database error handling
- [ ] retry policy
- [ ] idempotent writes where appropriate
- [ ] graceful degradation

## 18. Non-goals for the hackathon

Do not add complexity that does not improve judging evidence:

- hardware integration
- voice interface
- multi-agent swarm
- blockchain
- autonomous purchasing
- large integration marketplace
- second vector database
- unnecessary analytics suite

## 19. Product evolution after the hackathon

```text
MVP
  ↓
Industrial repair
  ↓
Multi-site field operations
  ↓
Predictive maintenance signals
  ↓
Parts and inventory intelligence
  ↓
Technician knowledge transfer
  ↓
Enterprise field-service platform
```

The hackathon submission remains intentionally narrow while the product architecture stays extensible.
