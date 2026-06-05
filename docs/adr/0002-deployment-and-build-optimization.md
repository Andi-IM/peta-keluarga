# ADR 0002: Deployment Strategy and Build Optimization

**Date:** 2026-06-02
**Status:** Accepted

## Context
We need a cost-effective and reliable hosting solution for the Family Network application. Since the application primarily visualizes a static dataset of family relationships, a serverless or static hosting model is preferred.

## Decision
We have decided to:
1. **Hosting Provider:** Use **GitHub Pages** for hosting.
2. **Deployment Method:** Utilize **Static Site Generation (SSG)** via `next build` (targeting the `out` directory as seen in the CI/CD workflow).
3. **Asset Optimization:** Set `images.unoptimized: true` in `next.config.mjs` to ensure compatibility with GitHub Pages, which does not support Next.js server-side image optimization.
4. **Build Resilience:** Temporarily set `typescript.ignoreBuildErrors: true` to prevent CI/CD failures during the rapid prototyping phase where data structures may evolve faster than type definitions.

## Consequences
### Positive (Benefits)
* **Zero Cost:** GitHub Pages provides free hosting for public repositories.
* **Simplicity:** Static exports are easy to distribute and require no server maintenance.
* **Speed:** High availability and fast load times via GitHub's CDN.

### Negative (Trade-offs/Risks)
* **No Server-Side Logic:** Features like dynamic API routes (middleware) or Incremental Static Regeneration (ISR) are not available.
* **Type Safety Debt:** Ignoring build errors can lead to runtime regressions if not monitored manually or reverted once the schema stabilizes.
* **Unoptimized Assets:** Larger image payloads due to the lack of server-side optimization.

## Superseded
None
