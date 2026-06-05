# ADR 0012: CI/CD Strategy and Build Policy

**Date:** 2026-06-02
**Status:** Accepted

## Context

The application needs to be automatically built and deployed to a hosting environment.

## Decision

In Commits `2a8d505` through `9c6f553`, we refined the CI/CD pipeline:

1. **GitHub Actions:** Created `nextjs.yml` to handle the build and deployment to GitHub Pages.
2. **Static Export:** Configured Next.js for a static build (`output: 'export'`) to allow hosting on non-Node.js servers.
3. **Build Resilience:** Updated `next.config.mjs` to set `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` to ensure the static export succeeds despite potential type inconsistencies during the prototyping phase.

## Consequences

### Positive

* **Automated Delivery:** Every push to `main` results in a new live version of the family tree.
* **Low Maintenance:** GitHub Pages removes the need for managing servers or databases.

### Negative

* **Reduced Safety:** Ignoring TypeScript errors can hide bugs that only appear at runtime.
* **Limited Features:** No support for dynamic routes or server-side rendering.

## Superseded

None
