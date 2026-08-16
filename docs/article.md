# RepairAtlas: Turning Repair History into Agentic Institutional Memory

## The problem with operational memory

Field-service organizations accumulate knowledge every time a technician diagnoses and repairs equipment. Yet much of that knowledge remains trapped in individual experience, free-form notes, old work orders, and disconnected documents.

The next technician sees the symptom, but not necessarily the experience behind the solution.

That creates a recurring cost: the organization repeatedly rediscovers knowledge it already paid to acquire.

RepairAtlas approaches the problem differently.

## From records to experience

A conventional maintenance system records that a work order happened. A retrieval system can search those records. An agent can go further: it can interpret a new failure, retrieve comparable experiences, compare their outcomes, recommend an action, execute a bounded workflow, and then learn from the result.

The fundamental unit of memory is therefore not a chat message. It is a **repair experience**.

A repair experience can contain:

- observed symptoms
- asset identity and context
- diagnosis
- attempted intervention
- parts used
- technician observations
- outcome
- confidence
- timestamp
- semantic embedding

This makes memory operational rather than decorative.

## Why CockroachDB is central

RepairAtlas deliberately avoids splitting operational state and AI memory across unrelated persistence systems.

CockroachDB can hold the relational state of an asset and the semantic representation of its repair experiences in the same system. Distributed vector indexing provides semantic retrieval, while the Managed MCP Server provides a governed interface for an AI agent to interact with the database.

The result is a simple architecture:

```text
Current operational state
          +
Historical repair experiences
          +
Semantic retrieval
          +
Agent actions
          +
Audit state
          ↓
      CockroachDB
```

The database is not a storage detail. It is part of the agent's intelligence loop.

## Why vector memory matters

Suppose the current incident is described as:

> "The press gets unusually hot after running for a while and airflow feels weak."

A previous technician may have written:

> "Temperature climbed after approximately forty minutes because the intake was obstructed."

Keyword search is not the important part of this relationship. Semantic retrieval can identify that these are related experiences even when their wording differs.

But similarity alone is not enough.

RepairAtlas also considers the **outcome**.

If one previous intervention was attempted and failed while another resolved the problem, the agent should not treat those experiences as equally useful.

## Remembering failure is as important as remembering success

Institutional memory becomes more valuable when it includes negative experience.

Imagine:

```text
Attempt 1
Replace fan
→ issue persisted

Attempt 2
Clear intake obstruction + replace filter
→ issue resolved
```

A future agent should be able to recognize that the first intervention did not solve the historical pattern and that the second has stronger evidence.

This is a fundamental difference between document retrieval and experience memory.

## The agent loop

RepairAtlas follows a closed operational loop:

```text
Observe
  ↓
Retrieve
  ↓
Reason
  ↓
Act
  ↓
Verify
  ↓
Learn
  ↺
```

The loop matters because the final step changes the system's future behavior.

A completed repair becomes a new memory. The next incident can therefore benefit from what happened today.

## Why AWS is part of the product

AWS is not included as a decorative deployment label.

Amazon Bedrock provides model reasoning. Amazon Bedrock AgentCore Runtime provides the execution environment for the agent, including session isolation and agent-oriented observability. Amazon S3 stores service documentation and repair artifacts.

The resulting division of responsibility is clear:

```text
AWS
├── reasoning
├── agent execution
└── documents

CockroachDB
├── operational truth
├── semantic memory
├── agent state
└── audit trail
```

## Safe agency

A production field-service agent should not receive unrestricted database or infrastructure privileges.

RepairAtlas therefore separates actions into classes.

**Read:** automatically permitted where authorized.

**Low-risk write:** policy checked.

**Consequential write:** requires technician approval.

**Forbidden:** rejected and audited.

The goal is not maximum autonomy. The goal is useful autonomy within a trustworthy operating boundary.

## The demonstration

The strongest demonstration is a before-and-after memory loop.

First, `PRESS-204` reports overheating. The agent retrieves previous repair experiences and finds that an airflow intervention resolved a similar issue while another intervention did not.

The technician approves a work order. The repair is completed. The outcome is recorded.

Then the same asset produces a differently worded incident.

The agent retrieves the newly reinforced experience and recommends the previously successful intervention.

The audience sees the central proposition without needing a long explanation:

> **The system learned from the repair.**

## Why this is not another chatbot

A chatbot remembers conversation context.

A RAG application retrieves documents.

A workflow application records transactions.

RepairAtlas combines all three concerns around a physical-world operational loop:

```text
current state
    +
historical experience
    +
semantic similarity
    +
outcome evidence
    +
controlled action
    +
new outcome
    ↓
continuous institutional memory
```

That is the product's core innovation.

## Long-term product direction

The first implementation focuses on equipment repair because it provides a clear, demonstrable use case. The architecture can later expand to other field operations where accumulated experience matters:

- solar maintenance
- HVAC service
- telecom infrastructure
- industrial machinery
- generators and pumps
- fleet maintenance
- utilities

The broader product thesis remains the same:

**Every operation should make the next operation smarter.**

## Closing

RepairAtlas treats memory as an operational capability rather than a feature checkbox.

CockroachDB provides the durable state and semantic memory foundation. AWS provides model reasoning, agent execution, and document storage. The agent turns those capabilities into a closed loop that remembers what happened, what worked, what failed, and what should happen next.

**Every repair teaches the next one.**
