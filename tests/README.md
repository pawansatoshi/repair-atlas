# Testing Strategy

RepairAtlas uses layered testing rather than relying only on the final demo.

## Unit tests

- input validation
- ranking logic
- action policy
- memory normalization
- embedding payload validation
- error mapping

## Database tests

- migrations from empty database
- constraints
- relational queries
- vector retrieval
- transaction behavior
- authorization scope

## Agent tests

### Happy path

```text
failure → retrieve → recommend → approve → write → outcome → memory
```

### Adversarial paths

- unknown asset
- no historical memory
- conflicting memories
- low confidence
- model timeout
- database timeout
- duplicate action
- rejected approval
- forbidden tool call
- malformed tool arguments

## End-to-end test

The golden PRESS-204 scenario must execute against real persistence and the actual deployed model/runtime path used by the application.

## Fresh-install test

A clean environment must be able to reproduce:

```text
install
→ configure
→ migrate
→ seed
→ run
→ execute demo
```

## Security checks

- secret scan
- dependency audit
- no credentials in source
- no unrestricted SQL tool
- least-privilege IAM review
- MCP permission review

## Release gate

A release candidate is not ready until all critical tests pass and the full application has been manually reviewed for correctness, safety, failure handling, and operational clarity.
