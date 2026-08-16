# ARCHITECTURE

## System Overview
Describe the complete request/data flow.

## Frontend
- Framework:
- Routing:
- State:
- Components:
- Features:
- Accessibility:
- i18n:

## Backend
- Runtime:
- API layer:
- Authentication:
- Authorization:
- Validation:
- Business logic:

## Data
- Database:
- Schema:
- Transactions:
- Indexes:
- Migrations:
- Pagination:
- Caching:

## AI / Agent
- Model/provider:
- Agent runtime:
- Tools:
- Memory:
- Retrieval:
- Guardrails:
- Human approval boundaries:

## External Services
List each integration, purpose, timeout, retry and failure behavior.

## Security Boundaries
Document trust boundaries, secrets, permissions, public/private surfaces and abuse controls.

## Observability
- Logs:
- Request IDs:
- Errors:
- Metrics:
- Traces:
- Alerts:

## Deployment
- Platform:
- Environments:
- Environment variables:
- Health checks:
- Rollback:

## Failure Modes
Document behavior for network, API, database, authentication, third-party and AI failures.

## Architecture Review
- [ ] No unnecessary dependency
- [ ] No client-trusted authorization
- [ ] No secret in client
- [ ] Clear separation of concerns
- [ ] Failure behavior defined
- [ ] Observability defined
- [ ] Scaling risks identified