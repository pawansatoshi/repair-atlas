# RepairAtlas — Judge Strategy

## Objective

Build a submission that a judge can understand quickly, verify technically, and remember after reviewing many projects.

## Five judging criteria

The strategy targets the five equally weighted hackathon criteria.

### 1. Agentic Memory Design — target 20/20

Evidence we must show:

- persistent operational state
- historical repair experiences
- semantic vector retrieval
- memory creation after a repair
- memory update/reinforcement
- future retrieval of learned experience
- successful and failed intervention history

The demo must prove that memory changes future behavior.

### 2. Technological Implementation — target 19/20

Evidence:

- CockroachDB is the system of record
- Distributed Vector Indexing is used for semantic repair memory
- Managed MCP Server is used for governed agent/database interaction
- transactional writes are real
- Amazon Bedrock is part of reasoning
- AgentCore Runtime hosts the agent
- S3 has a real document/artifact role
- security and failure handling are implemented

### 3. Real-World Impact — target 19/20

Message:

> Field teams repeatedly rediscover repair knowledge that already exists inside their organization.

Show the cost of that problem through a concrete asset failure and explain how accumulated experience reduces diagnostic repetition.

### 4. Product Readiness — target 19/20

Show:

- professional operations UI
- loading/error/empty states
- authentication boundary
- least-privilege tools
- approval for consequential actions
- audit trail
- responsive layout
- deployment architecture
- graceful degradation

### 5. Creativity & Originality — target 19/20

The differentiator is not "AI + memory."

It is:

> **experience memory that learns from both successful and failed physical-world interventions and uses those outcomes in future decisions.**

## Judge questions we must answer visually

### Where is the memory?

Show retrieved repair experiences and the memory record being created after the new repair.

### Why CockroachDB?

Show operational state and vector memory living together.

### Why MCP?

Show the agent using a governed database interaction path rather than unrestricted SQL access.

### Why AWS?

Show Bedrock reasoning, AgentCore execution, and S3 documents in the real request path.

### Why an agent?

Show the sequence of retrieval, comparison, recommendation, approval, action, and learning.

### What is original?

Show that a completed repair becomes future decision context.

### Can I trust it?

Show approval boundaries, denied actions, audit records, and failure handling.

## Anti-patterns to avoid

- generic chatbot UI
- generic document Q&A
- fake memory
- hard-coded recommendations
- fake autonomous actions
- unrestricted model SQL
- AWS mentioned only in README
- CockroachDB used only as a conventional relational database
- excessive feature count
- long video introduction

## Demo scoring principle

Every major claim should have visible evidence.

```text
Claim → Evidence → Outcome
```

Example:

```text
"The agent remembers repairs"
→ show retrieved historical repair
→ show new repair written to memory
→ trigger a second incident
→ show the new incident retrieving the learned experience
```
