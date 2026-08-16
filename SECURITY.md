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

- explicit tool allowlist
- role-based authorization
- forbidden operation list
- human approval gates
- no administrative SQL tool

### Credential exposure

Secrets could leak through source code, logs, prompts, or UI.

Controls:

- environment/managed secret configuration
- `.env` ignored by Git
- secret scanning
- no credentials in logs
- least-privilege IAM

### Cross-session contamination

One user's operational context must not appear in another user's session.

Controls:

- explicit organization/site/asset scope
- authorization before retrieval
- session identifiers
- AgentCore Runtime session isolation where applicable
- database-level access controls

### SQL injection

User-controlled values must never become raw SQL fragments.

Controls:

- parameterized queries
- typed validation
- no model-generated unrestricted SQL
- constrained database tools

### Data integrity

A repair outcome must not leave the operational state and memory state in an ambiguous condition.

Controls:

- transactional writes where appropriate
- idempotency keys for retryable actions
- audit events
- explicit failure states

## Agent permission matrix

| Capability | Policy |
|---|---|
| Read asset | Allowed when authorized |
| Read repair history | Allowed when authorized |
| Semantic memory search | Allowed when authorized |
| Read service documentation | Allowed when authorized |
| Draft diagnosis | Allowed |
| Create work order | Approval required |
| Change operational state | Approval required |
| Record technician outcome | Authorized write |
| Create memory | Authorized system action |
| Delete repair history | Forbidden |
| Alter audit history | Forbidden |
| Modify schema | Forbidden |
| Read credentials | Forbidden |

## Logging

Log operational metadata needed for debugging and auditability:

- timestamp
- session identifier
- user/organization scope
- asset identifier
- tool name
- action class
- success/failure
- latency
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

The hackathon MVP focuses on strong least-privilege boundaries. Future production work should include formal threat modeling, penetration testing, stronger tenant isolation, compliance requirements, key management, retention policies, and security monitoring.
