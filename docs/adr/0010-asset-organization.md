# ADR 0010: Asset Organization and Correction

**Date:** 2026-06-02
**Status:** Accepted

## Context
Visual assets (icons, logos) are needed for branding and the user interface.

## Decision
Initially, in Commit `5d27475`, we placed assets in the project root. However, this was corrected in Commit `2690c0c` to align with Next.js standards.
1. **Directory Change:** Moved all brand assets (icons, placeholders) from the root to the `public/` directory.
2. **Standardization:** Ensured the existence of standard files like `apple-icon.png` and `icon.svg` in the public directory for automatic SEO/Meta handling by Next.js.

## Consequences
### Positive
* **Next.js Compliance:** Assets in `/public` are correctly served at the root URL path.
* **Root Cleanup:** Reduced clutter in the project's root directory.

### Negative
* **Redundant Commit History:** The initial root-level placement created unnecessary git objects and history noise.

## Superseded
* **ADR 1 (Partial):** Assets are no longer tracked in the root as placeholders; they are now in `/public`.
