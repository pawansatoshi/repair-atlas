# RepairAtlas — QA & Release Gate

> **Release discipline:** No evidence → no PASS. Unknown is not PASS. Build success is not application success.

This file is the executable release checklist for RepairAtlas. It is intentionally stricter than a normal build checklist because the project is an agentic application whose correctness spans UI, APIs, persistent memory, AI behavior, external services, security, and deployment.

## Release status

- Project: RepairAtlas
- Version: `__________`
- Commit: `__________`
- Deployment: `__________`
- Live URL: `__________`
- Reviewer: `__________`
- Date: `__________`

**Status:** `NOT READY` until every critical gate is verified.

---

## 0. Project contract

- [ ] Product purpose documented
- [ ] Target users documented
- [ ] Supported browsers documented
- [ ] Mobile requirements documented
- [ ] Desktop/tablet requirements documented
- [ ] Touch and keyboard requirements documented
- [ ] Accessibility requirements documented
- [ ] Authentication requirements documented
- [ ] Authorization requirements documented
- [ ] Data/storage requirements documented
- [ ] API/integration requirements documented
- [ ] Environment variables documented
- [ ] Production secrets identified and protected
- [ ] Deployment architecture documented
- [ ] Expected traffic/load assumptions documented
- [ ] Privacy requirements documented
- [ ] Observability requirements documented

## 1. Architecture audit

- [ ] Framework and runtime versions verified
- [ ] Dependency versions reviewed
- [ ] Package manager and lockfile verified
- [ ] Build/lint/typecheck scripts verified
- [ ] Routing verified
- [ ] API architecture verified
- [ ] State management verified
- [ ] CockroachDB architecture verified
- [ ] Agent architecture verified
- [ ] Memory architecture verified
- [ ] AWS integration verified
- [ ] Authentication/authorization boundaries verified
- [ ] Error boundaries verified
- [ ] Loading/empty/error states designed
- [ ] Retry and timeout strategy verified
- [ ] Logging/monitoring strategy verified

## 2. Requirement / logic matrix

For every feature, verify normal and adversarial paths:

- [ ] Normal path
- [ ] Invalid input
- [ ] Empty input
- [ ] Missing data
- [ ] Duplicate action
- [ ] Repeated action
- [ ] Timeout
- [ ] Network failure
- [ ] Server failure
- [ ] Unauthorized user
- [ ] Expired session
- [ ] Malformed response
- [ ] Unexpected response type
- [ ] Slow response
- [ ] Retry
- [ ] Refresh
- [ ] Back navigation
- [ ] Direct URL access
- [ ] Concurrent action

## 3. Implementation integrity

- [ ] No fake success states
- [ ] No fake API calls
- [ ] No console-only persistence
- [ ] No placeholder production logic
- [ ] No swallowed errors
- [ ] No silent failures
- [ ] No hardcoded secrets
- [ ] No exposed credentials/private keys
- [ ] No unnecessary dependencies
- [ ] No dead/unreachable production code
- [ ] Boundary data is validated
- [ ] Server-side validation exists where required
- [ ] Async operations have appropriate loading/success/empty/error/timeout states

## 4. Static code audit

Search the complete repository for:

- [ ] `TODO`
- [ ] `FIXME`
- [ ] `HACK`
- [ ] accidental `console.log` / debug logging
- [ ] unsafe `any` / casts
- [ ] dangerous HTML injection
- [ ] `eval` or equivalent dynamic execution
- [ ] hardcoded URLs that should be configuration
- [ ] API keys/secrets/tokens/private keys
- [ ] debug/test credentials
- [ ] mock/placeholder data used in production paths
- [ ] fake success responses
- [ ] dead routes
- [ ] unused imports/variables
- [ ] duplicate logic
- [ ] race conditions
- [ ] unhandled promises
- [ ] missing `await` where required
- [ ] infinite loops / runaway retries
- [ ] memory/resource leaks

Every finding is classified `CRITICAL / HIGH / MEDIUM / LOW / INFO` and either fixed or explicitly accepted with rationale.

## 5. Type / lint / build

- [ ] Clean dependency install
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Production build PASS
- [ ] Static generation PASS where applicable
- [ ] Route validation PASS
- [ ] Bundle reviewed
- [ ] Warnings classified
- [ ] No warnings suppressed merely to hide defects
- [ ] Full typecheck/lint/build rerun after meaningful fixes

## 6. Functional QA

For every user-facing feature:

- [ ] Happy path
- [ ] Invalid input
- [ ] Empty input
- [ ] Duplicate input
- [ ] Boundary values
- [ ] Malformed input
- [ ] Refresh
- [ ] Back
- [ ] Forward
- [ ] Direct URL
- [ ] Repeated click
- [ ] Double submit
- [ ] Rapid interaction
- [ ] Interrupted request
- [ ] Failed request
- [ ] Timeout
- [ ] Retry

Test the wrong thing a user can realistically do, not only the intended path.

## 7. API / backend QA

For every endpoint/tool action:

- [ ] HTTP/method validation
- [ ] Authentication
- [ ] Authorization
- [ ] Input/schema validation
- [ ] Content-type validation
- [ ] Malformed JSON handling
- [ ] Missing fields
- [ ] Wrong types
- [ ] Oversized input
- [ ] Duplicate request handling
- [ ] Replay/idempotency where required
- [ ] Timeout handling
- [ ] Upstream failure handling
- [ ] Database failure handling
- [ ] Third-party failure handling
- [ ] Rate limiting/abuse controls where appropriate
- [ ] Correct HTTP status codes
- [ ] Safe error messages
- [ ] No secret leakage
- [ ] No stack-trace leakage

## 8. CockroachDB / data QA

- [ ] Schema matches actual application behavior
- [ ] Null/undefined handling verified
- [ ] Type validation verified
- [ ] Duplicate records prevented where required
- [ ] Transaction boundaries verified
- [ ] Concurrent writes tested
- [ ] Partial-write failure tested
- [ ] Retry behavior tested
- [ ] Migration compatibility checked
- [ ] Indexes reviewed
- [ ] Query performance reviewed
- [ ] Pagination verified
- [ ] Large-result behavior verified
- [ ] Vector/semantic retrieval verified where used
- [ ] Persistent memory survives refresh/new session
- [ ] Memory retrieval affects agent behavior
- [ ] Memory updates are written after meaningful outcomes
- [ ] Memory provenance/confidence is preserved where applicable

## 9. Agentic-memory QA

The agent must demonstrably perform the lifecycle:

**store → retrieve → reason → act → update**

- [ ] New memory can be stored
- [ ] Existing memory can be retrieved
- [ ] Structured filters work
- [ ] Semantic retrieval works where intended
- [ ] Retrieved memory is actually injected into reasoning/context
- [ ] Agent behavior changes because of remembered context
- [ ] Completed action produces an updated memory record
- [ ] Contradictory/stale memory is handled safely
- [ ] Agent does not fabricate remembered facts
- [ ] Memory access is scoped to the correct tenant/user/asset
- [ ] Memory failures degrade safely
- [ ] No sensitive memory is unnecessarily exposed

## 10. Authentication / authorization

- [ ] Logged-out state
- [ ] Logged-in state
- [ ] Expired session
- [ ] Invalid token
- [ ] Missing token
- [ ] Malformed token
- [ ] Wrong user
- [ ] Wrong role
- [ ] Revoked access
- [ ] Protected direct URL
- [ ] Protected API without authentication
- [ ] Cross-user identifier attack tested
- [ ] Client-provided identity is never trusted without server verification

## 11. Security audit

- [ ] Secrets protected
- [ ] Environment variables used correctly
- [ ] Least-privilege IAM
- [ ] Scoped CockroachDB credentials
- [ ] MCP/tool permissions constrained
- [ ] Input validation
- [ ] SQL injection resistance
- [ ] XSS resistance
- [ ] SSRF review
- [ ] Open redirect review
- [ ] Path traversal review
- [ ] Unsafe URL handling reviewed
- [ ] Sensitive logs removed/redacted
- [ ] Error leakage reviewed
- [ ] Dependency vulnerabilities reviewed
- [ ] CORS restricted appropriately
- [ ] Security headers reviewed
- [ ] Rate limiting/abuse controls reviewed
- [ ] Agent action boundaries enforced

## 12. Accessibility

- [ ] Semantic HTML
- [ ] Heading hierarchy
- [ ] Form labels
- [ ] Accessible validation errors
- [ ] Keyboard navigation
- [ ] Tab
- [ ] Shift+Tab
- [ ] Enter
- [ ] Space
- [ ] Escape
- [ ] Visible focus
- [ ] Focus restoration
- [ ] Modal focus containment
- [ ] Background inertness for true modals
- [ ] Screen-reader semantics
- [ ] ARIA labels/states only where needed
- [ ] Color contrast
- [ ] Reduced-motion behavior
- [ ] Zoom/large-text behavior

### Modal contract

`OPEN → focus inside → Tab remains inside → Escape closes → background inert → focus returns to trigger`

Do not claim modal accessibility merely because `aria-modal="true"` exists.

## 13. Responsive / device QA

Test at minimum:

- [ ] 320px
- [ ] 360px
- [ ] 375px
- [ ] 390px
- [ ] 414px
- [ ] 768px
- [ ] 1024px
- [ ] 1280px
- [ ] 1440px
- [ ] 1920px

Verify:

- [ ] No horizontal overflow
- [ ] No overlap
- [ ] No clipped text
- [ ] No clipped buttons
- [ ] All controls reachable
- [ ] Modals work
- [ ] Navigation works
- [ ] Fixed elements do not collide
- [ ] Keyboard is not obscuring controls
- [ ] Safe-area handling where needed
- [ ] Orientation changes handled

Browser matrix where available:

- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Edge where relevant

## 14. Touch / input QA

- [ ] Tap
- [ ] Double tap
- [ ] Long press where relevant
- [ ] Swipe where relevant
- [ ] Scroll
- [ ] Touch target sizing
- [ ] Touch + modal
- [ ] Touch + dropdown
- [ ] Touch + drag
- [ ] Double-submit protection
- [ ] Pointer cancellation
- [ ] Mouse hover
- [ ] Mouse click
- [ ] Right click where relevant
- [ ] Drag/pointer leave where relevant

## 15. Performance

- [ ] Initial load reviewed
- [ ] JS bundle reviewed
- [ ] Images optimized
- [ ] Lazy loading where useful
- [ ] Image fallbacks
- [ ] Duplicate requests checked
- [ ] N+1 requests checked
- [ ] Render loops checked
- [ ] Memory leaks checked
- [ ] Excessive re-renders checked
- [ ] Blocking scripts checked
- [ ] Caching strategy checked
- [ ] API latency reviewed
- [ ] Database queries reviewed
- [ ] Timeout behavior verified

Record measurements only when actually measured.

## 16. Network failure QA

- [ ] Offline
- [ ] Slow 3G / constrained network
- [ ] High latency
- [ ] Request timeout
- [ ] DNS failure where testable
- [ ] API 400
- [ ] API 401
- [ ] API 403
- [ ] API 404
- [ ] API 429
- [ ] API 500
- [ ] CockroachDB unavailable
- [ ] AWS/AI service unavailable
- [ ] Third-party outage

The UI must fail clearly and recover where recovery is possible.

## 17. Third-party integration audit

For every external service:

- [ ] SDK/API version verified
- [ ] Compatibility verified
- [ ] Authentication failure tested
- [ ] Timeout tested
- [ ] Retry tested
- [ ] Malformed response tested
- [ ] Rate limit tested/handled
- [ ] Service unavailable tested
- [ ] Fallback behavior verified

## 18. Observability

- [ ] Runtime errors observable
- [ ] Structured logs where appropriate
- [ ] Request/correlation IDs where useful
- [ ] API failures observable
- [ ] Important agent actions observable
- [ ] Deployment health observable
- [ ] Alerts where appropriate
- [ ] No sensitive data in logs
- [ ] AI/provider failures distinguishable from application failures
- [ ] Database failures distinguishable from agent failures

## 19. Deployment QA

- [ ] Production build succeeds
- [ ] Deployment reports READY
- [ ] HTTPS works
- [ ] Environment variables loaded
- [ ] API routes work
- [ ] Static assets work
- [ ] Images/fonts work
- [ ] Redirects work
- [ ] Deep links work
- [ ] Metadata works
- [ ] Robots/sitemap handled where applicable
- [ ] Production smoke test passes

## 20. Production telemetry

After deployment, inspect actual production evidence:

- [ ] Runtime errors reviewed
- [ ] Warnings reviewed
- [ ] 4xx reviewed
- [ ] 5xx reviewed
- [ ] Failed API routes reviewed
- [ ] Deployment errors reviewed
- [ ] Function timeouts reviewed
- [ ] External-service failures reviewed

Deployment success is not application success.

## 21. Adversarial QA

Attempt to break the application as:

- [ ] Malicious user
- [ ] Confused user
- [ ] Slow-network user
- [ ] Keyboard-only user
- [ ] Screen-reader user
- [ ] Mobile user
- [ ] Power user
- [ ] First-time user

Attack with:

- [ ] Rapid clicks
- [ ] Repeated submission
- [ ] Refresh during action
- [ ] Back during action
- [ ] Multiple tabs
- [ ] Stale tab
- [ ] Expired session
- [ ] Malformed URL/query
- [ ] Empty state
- [ ] Huge input
- [ ] Unicode/emoji input
- [ ] Network interruption
- [ ] Invalid agent/tool request
- [ ] Unavailable AI provider
- [ ] Unavailable database

## 22. Regression discipline

Every fixed defect must record:

1. Reproduction
2. Root cause
3. Fix
4. Regression test
5. Post-fix verification

A bug without a regression test is not considered closed when a test is practical.

## 23. Final release gate

All of these must be verified before `READY`:

- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Production build PASS
- [ ] Deployment READY
- [ ] Runtime errors reviewed
- [ ] Critical bugs = 0
- [ ] Known high-severity bugs = 0
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] API tested
- [ ] Database persistence tested
- [ ] Agent memory tested
- [ ] Security reviewed
- [ ] Accessibility reviewed
- [ ] Mobile reviewed
- [ ] Desktop reviewed
- [ ] Touch reviewed
- [ ] Keyboard reviewed
- [ ] Network failures reviewed
- [ ] External integrations reviewed
- [ ] Regression tests pass
- [ ] Production smoke test passes
- [ ] Unverified critical items = 0

## Final report

```text
PROJECT:
VERSION:
COMMIT:
DEPLOYMENT:
LIVE URL:

BUILD: PASS/FAIL
TYPECHECK: PASS/FAIL
LINT: PASS/FAIL
RUNTIME: PASS/FAIL
SECURITY: PASS/FAIL
ACCESSIBILITY: PASS/FAIL
RESPONSIVE: PASS/FAIL
API: PASS/FAIL
DATABASE: PASS/FAIL
AGENT MEMORY: PASS/FAIL
AUTH: PASS/FAIL
PERFORMANCE: PASS/FAIL
PRODUCTION: PASS/FAIL

KNOWN ISSUES:
- 

FIXED ISSUES:
- 

UNVERIFIED:
- 

FINAL STATUS: READY / NOT READY
```

## Operating principle

**DISCOVER → REPRODUCE → ISOLATE → ROOT CAUSE → FIX → TEST → DEPLOY → OBSERVE → RECHECK → REGRESSION TEST → RELEASE**

Never convert `UNKNOWN` into `PASS`.

Never claim `bug-free` without evidence.

A clean build proves only that the build passed. A successful deployment proves only that deployment succeeded. `READY` means the release gates above have been actually verified.