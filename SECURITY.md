# Security Policy

## Security objective

RepairAtlas is an agentic application. Security is therefore part of the agent architecture, not a final checklist.

The agent must be able to retrieve and update operational information without receiving unrestricted database or infrastructure authority.

## Threat model

### Prompt injection

External documents, technician notes, or user-provided text may contain instructions that attempt to override agent policy.

Controls:

- treat retrieved content as data, not authority
- keep tool permissions outside model-generated text
- enforce action policy in application code
- require approval for consequential actions

### Excessive agency

A model could attempt a destructive or unauthorized operation.

Controls:

- explicit action boundary
- constrained database access
- human approval gates
- no administrative SQL tool exposed to the model

### Credential exposure

Secrets could leak through source code, logs, prompts, or UI.

Controls:

- environment/managed secret configuration
- `.env` ignored by Git
- secret scanning checks in the release smoke test
- no credentials in logs
- least-privilege AWS/database configuration

### Cross-session / tenant contamination

The current hackathon deployment uses a server-configured organization scope (`DEMO_ORG_ID`) and asset-scoped queries. It does **not** implement end-user authentication or a multi-user identity provider yet. Production multi-tenant identity and authorization therefore remain a hardening item rather than a claimed completed control.

Controls currently present:

- server-side organization scope
- asset scope on memory and operational queries
- database foreign-key relationships
- no client-provided organization identifier

### SQL injection

User-controlled values must never become raw SQL fragments.

Controls:

- parameterized queries
- typed validation
- no model-generated unrestricted SQL

### Data integrity

A repair outcome must not leave the operational state and memory state in an ambiguous condition.

Controls:

- transactional writes where appropriate
- duplicate open/staged work-order reuse
- audit events
- explicit failure states
- repair-memory provenance through `source_event_id`

## Agent permission boundary

| Capability | Current policy |
|---|---|
| Read asset-scoped repair memory | Allowed within configured organization scope |
| Semantic memory search | Allowed within configured organization/asset scope |
| Draft diagnosis | Allowed |
| Create work order | Explicit approval required |
| Record technician outcome | Application write path |
| Create repair memory | Application write path after an outcome |
| Delete repair history | No application endpoint |
| Alter audit history | No application endpoint |
| Modify schema | No application endpoint |
| Read credentials | Not exposed to the model |

## Logging

Log operational metadata needed for debugging and auditability:

- timestamp
- session identifier where available
- organization scope
- asset identifier
- action class
- success/failure
- latency where available
- safe error code

Never log:

- API keys
- database passwords
- access tokens
- private credentials
- unnecessary personal data

## Incident response

If a credential is exposed:

1. revoke it immediately
2. rotate the credential
3. inspect repository history and logs
4. determine blast radius
5. document the incident
6. remove the secret from source and generated artifacts

## Production hardening roadmap

The hackathon MVP focuses on bounded agent actions, scoped database access, explicit approval, and secret hygiene. Before treating the application as a general multi-tenant production system, add formal end-user authentication/authorization, stronger tenant isolation, penetration testing, compliance requirements, key management, retention policies, and security monitoring.
