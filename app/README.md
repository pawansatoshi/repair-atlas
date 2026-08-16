# Application Layer

RepairAtlas should feel like field-service operations software rather than a generic chat application.

## Primary views

### Operations dashboard

- active incidents
- asset status
- work-order state
- recent agent activity

### Asset detail

- asset identity
- current state
- event timeline
- previous repairs
- active work orders

### Diagnostic workspace

- current problem
- agent recommendation
- retrieved memory evidence
- supporting documentation
- action status
- approval controls

### Memory view

- similar experiences
- similarity/relevance indicator
- previous intervention
- outcome
- source repair

## UX principles

1. Evidence before explanation.
2. Actions are explicit.
3. Approval boundaries are visible.
4. Errors explain what happened and what the user can do next.
5. The UI never pretends an action succeeded before persistence confirms it.
6. Mobile and desktop are both supported.

## Golden UI moment

The most important screen transition is:

```text
New failure
→ relevant memory appears
→ recommendation cites the experience
→ technician approves
→ work order changes
→ outcome is captured
→ new memory appears
```
