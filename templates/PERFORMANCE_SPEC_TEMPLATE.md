# PERFORMANCE SPECIFICATION

## Targets
Record measured targets; never invent results.

- LCP:
- INP:
- CLS:
- TTFB where useful:

## Frontend
- JS bundle strategy:
- Code splitting:
- Lazy loading:
- Rendering strategy:
- Re-render controls:
- Memory leak checks:

## Media
- Image formats:
- Responsive sizes:
- LCP image strategy:
- Lazy loading:
- Video strategy:
- Font loading:

## Network
- Request budget:
- Duplicate-request prevention:
- Caching:
- Compression:
- API timeout:
- Retry policy:

## Backend / Database
- API latency:
- Query latency:
- Indexes:
- N+1 prevention:
- Pagination:
- Caching:

## Mobile
Test on realistic mobile conditions, including constrained CPU/network where available.

## Measurement
Record tool, date, environment and actual evidence for each metric. Do not label estimates as measurements.

## Release Gate
- [ ] No known blocking performance regression
- [ ] Critical assets optimized
- [ ] Unnecessary requests removed
- [ ] Images optimized
- [ ] Fonts reviewed
- [ ] API/database hotspots reviewed
- [ ] Core Web Vitals measured where possible
