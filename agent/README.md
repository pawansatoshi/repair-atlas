# Agent Layer

## Mission

The RepairAtlas agent converts a technician's failure report into an evidence-backed, bounded operational workflow.

## Agent state machine

```text
IDLE
 ↓
UNDERSTAND
 ↓
RETRIEVE
 ↓
COMPARE
 ↓
RECOMMEND
 ↓
AWAIT_APPROVAL (when required)
 ↓
ACT
 ↓
VERIFY
 ↓
LEARN
 ↓
COMPLETE
```

## Tool groups

### Retrieval

- asset state
- asset history
- repair memory
- documents
- open work orders

### Action

- create work order
- update work order
- record repair outcome
- create repair memory

## Tool policy

Tool permissions are enforced by application code and database permissions, not by the model's instructions alone.

The model can propose an action, but the policy layer determines whether that action is allowed.

## Evidence-first responses

Agent responses should identify:

- current asset state used
- historical evidence retrieved
- outcome evidence
- recommended next step
- approval requirement

Avoid exposing private chain-of-thought. Show concise decision evidence and tool activity instead.

## Memory write policy

A new semantic memory should be created from a completed or sufficiently verified repair experience, not from arbitrary conversation text.

The memory should retain provenance back to the repair event.

## Low-confidence policy

When evidence is weak or conflicting:

```text
Do not invent certainty.
→ explain the evidence gap
→ request technician inspection
→ preserve the unresolved state
```
