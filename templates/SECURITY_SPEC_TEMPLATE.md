# SECURITY SPECIFICATION

## Security Baseline
- Application baseline: OWASP ASVS
- API baseline: OWASP API Security Top 10

## Authentication
- Method:
- Session/token model:
- Expiration:
- Revocation:
- MFA where required:

## Authorization
- Roles:
- Resource ownership:
- Server-side checks:
- Object-level authorization:
- Function-level authorization:

## Input / Output
- Request validation:
- Schema validation:
- Output filtering:
- Content types:
- File validation:

## Secrets
- Secret storage:
- Client exposure check:
- Rotation:
- Logging restrictions:

## Web Security
- XSS:
- Injection:
- CSRF where applicable:
- SSRF:
- Open redirects:
- Path traversal:
- CORS:
- Security headers:
- Rate limiting:

## Dependencies
- Vulnerability scanning:
- Update policy:
- Lockfile:

## AI / Agent Security
- Tool permissions:
- Database permissions:
- AWS/IAM permissions:
- Prompt/tool boundary:
- Human approval:
- Audit trail:
- Sensitive-data handling:

## Blockchain (if applicable)
- Chain ID:
- Contract verification:
- Token/decimals:
- Wallet/network mismatch:
- Transaction/replay protection:

## Logging
Never log passwords, tokens, API keys, private keys, secrets or unnecessary personal information.

## Security Release Gate
- [ ] No committed secrets
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Object-level authorization verified
- [ ] Input validation verified
- [ ] Dependency audit reviewed
- [ ] Security headers reviewed
- [ ] Error leakage reviewed
- [ ] Abuse cases reviewed
