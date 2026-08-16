# Database Layer

CockroachDB is the authoritative operational and memory store for RepairAtlas.

## Planned responsibilities

- asset state
- asset events
- work orders
- repair experiences
- semantic embeddings
- agent actions
- audit events

## Core invariants

1. Every repair memory must reference a real repair experience.
2. Every repair experience must reference an asset.
3. Operational state must remain relational and authoritative.
4. Vector retrieval must preserve authorization and entity scope.
5. Destructive history deletion is not exposed to the agent.

## Planned vector memory

The repair-memory record will contain an embedding plus structured evidence such as:

- asset ID
- repair event ID
- failure pattern
- symptoms
- diagnosis
- action taken
- outcome
- success flag
- confidence
- timestamps

The exact vector dimension, index configuration, and similarity operator will be finalized against the current CockroachDB version during implementation.

## Migration policy

Schema changes must be versioned and reproducible from a fresh environment.

The repository must be able to demonstrate:

```text
fresh database
→ migrations
→ seed data
→ vector index
→ application
```

## Seed data

The demo dataset should contain believable successful, failed, and unrelated repair experiences. The golden `PRESS-204` scenario must be reproducible without hard-coded application responses.
