# RepairAtlas — Judge Evidence Guide

This is the short path for a reviewer who wants to understand the product, the engineering work, and the evidence without reading the entire repository.

## 1. Start with the product

Open the deployed RepairAtlas application and run the golden scenario:

> `PRESS-204 overheating after extended operation`

Expected product story:

```text
incident
  ↓
retrieve relevant repair memory
  ↓
compare successful + failed interventions
  ↓
bounded recommendation
  ↓
human approval
  ↓
work order
  ↓
repair outcome
  ↓
durable memory
```

The UI also contains a plain-language usage guide, factory-value explanation, examples, and FAQ.

## 2. Open the interactive architecture

Use the deployed `/architecture` route.

It provides three views:

- **Architecture** — click each system component to see its job.
- **4-day engineering journey** — expand the real debugging findings and resolutions.
- **Judge FAQ** — concise product, safety, AWS, and memory answers.

The architecture intentionally explains the system like a factory workflow rather than a cloud-service catalogue.

## 3. Technology responsibilities

| Technology | Concrete responsibility |
|---|---|
| Next.js + React | Product UI and server APIs |
| AWS Amplify | Production web hosting |
| Amazon Bedrock | Model reasoning + Titan Text Embeddings V2 |
| AgentCore Runtime | Target managed execution environment for the bounded agent |
| CockroachDB Cloud | Transactional system of record + durable repair memory |
| CockroachDB vector indexing | Semantic similarity retrieval |
| CockroachDB Managed MCP | Target governed database interface for the agent |

## 4. What AWS actually helped us solve

AWS was used for concrete engineering needs:

- Amplify gave us a deployed production web path.
- Bedrock provided the reasoning and embedding capabilities used by the application.
- AgentCore provided the managed runtime path we investigated for the agent.
- CloudShell let us reproduce and diagnose cloud/deployment issues against the real environment.

The project does not add AWS services simply to make the architecture look bigger.

## 5. Real debugging evidence

The development log records actual failures and their classification:

- local PostgreSQL socket confusion in CloudShell
- missing TypeScript tooling
- CloudShell disk exhaustion (`ENOSPC`)
- missing runtime variables during deterministic seeding
- Amplify SSR environment-variable visibility problem
- AgentCore invocation failure caused by a UUID JSON-serialization boundary
- runtime-version/deployment-state investigation
- shell searches aimed at temporary paths instead of the repository

These are kept because they demonstrate the engineering process and make it possible to audit what happened.

## 6. What is verified vs pending

### Verified in the deployed application

- CockroachDB connectivity
- persistent repair memory
- VECTOR(1024) embeddings
- semantic retrieval
- Bedrock reasoning
- successful + failed intervention comparison
- approval-gated work-order creation
- repair outcome persistence
- durable memory persistence
- refresh persistence
- read-only evidence review
- responsive mobile interaction

### Still explicitly tracked

- independent deployed AgentCore runtime invocation evidence
- full governed MCP end-to-end evidence if retained in the final path
- final security/release gate after the last code change

We intentionally do not convert configuration into a claim of runtime verification.

## 7. Why this matters to a factory

A factory does not need another chatbot. It needs a system that remembers what technicians actually did and what happened afterward.

RepairAtlas turns:

**technician experience → structured outcome → searchable memory → better next diagnosis**

The business value is operational: preserve expertise, reduce repeated failed interventions, reduce unnecessary replacement, and keep consequential actions under human control.

## Evidence principle

**Unknown is not Pass. Configured is not Verified. A green build is not proof of the end-to-end product.**
