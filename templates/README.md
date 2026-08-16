# Universal Website Project Template

This directory is the reusable starting system for future web products.

## Start a new project

Copy these files into the new repository and rename/update them for the project:

1. `WEBSITE_PRODUCTION_BUILD_PROMPT.md` — master coding-agent instruction
2. `PROJECT_CONTRACT_TEMPLATE.md` → `PROJECT_CONTRACT.md`
3. `DESIGN_SYSTEM_TEMPLATE.md` → `DESIGN_SYSTEM.md`
4. `ARCHITECTURE_TEMPLATE.md` → `ARCHITECTURE.md`
5. `UX_SPEC_TEMPLATE.md` → `UX_SPEC.md`
6. `I18N_SPEC_TEMPLATE.md` → `I18N_SPEC.md`
7. `SECURITY_SPEC_TEMPLATE.md` → `SECURITY_SPEC.md`
8. `PERFORMANCE_SPEC_TEMPLATE.md` → `PERFORMANCE_SPEC.md`
9. `../PROJECT_ZERO_BUG_DELIVERY_PROTOCOL.md` → `QA_RELEASE_GATE.md`

## Operating rule

Do not start large-scale implementation before the contract, UX, architecture, design-system and security assumptions have been reviewed.

The master prompt is intentionally technology-neutral. Apply the project's actual framework, database, cloud provider and integrations after verifying their current official documentation.

## Release philosophy

`UNKNOWN != PASS`

`BUILD PASS != PRODUCTION PASS`

`DEPLOYMENT PASS != APPLICATION PASS`

The template is a delivery system, not a guarantee of zero defects. Evidence is required before release.