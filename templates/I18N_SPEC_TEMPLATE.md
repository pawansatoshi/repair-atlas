# INTERNATIONALIZATION SPECIFICATION

## Locales
- Default:
- Supported:
- Future-compatible:

## Translation Architecture
- Resource format:
- Namespace strategy:
- Missing translation behavior:
- Fallback locale:

## Locale Formatting
- Dates:
- Times:
- Numbers:
- Currency:
- Percentages:
- Relative time:
- Pluralization:

## HTML
- `lang` handling:
- `dir` handling:

## RTL
Use logical CSS properties. Verify navigation, cards, dialogs, forms, icons, charts, tables and sidebars.

## Layout Resilience
Test deliberately long translations, short translations, mixed scripts, Unicode and emoji. Never assume English string length.

## Language Switching
- Preserve route where possible
- Preserve safe user state where appropriate
- Persist preference
- Update `lang`
- Update `dir`
- Update metadata where required
- Never expose translation keys

## Voice
Voice recognition/synthesis language must follow the selected locale where supported, with graceful fallback.

## QA Matrix
- [ ] English
- [ ] Hindi
- [ ] Arabic / RTL
- [ ] German / long text
- [ ] Japanese / script rendering
- [ ] Dates
- [ ] Numbers
- [ ] Currency
- [ ] Plurals
- [ ] Language switching
- [ ] Long labels/buttons
