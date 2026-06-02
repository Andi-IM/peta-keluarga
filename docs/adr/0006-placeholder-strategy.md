# ADR 0006: Scaffolding and Directory Placeholder Strategy

**Date:** 2026-06-02
**Status:** Accepted

## Context
At the start of the project, we needed to establish a clear directory structure for a Next.js application before the actual implementation of features. Git does not track empty directories, which can lead to inconsistencies when multiple developers or environments are involved.

## Decision
We decided to use a **placeholder file strategy** (Commits `1071628` through `94f20d4`). We created small marker files named `a` in all primary directories:
- `app/a`
- `components/a`
- `hooks/a`
- `lib/a`
- `public/a`
- `styles/a`
- `components/ui/a`

## Consequences
### Positive
* **Structural Consistency:** The project's architectural skeleton was committed and shared before any code was written.
* **Predictable Organization:** Ensured that subsequent "Add files via upload" commits followed a pre-defined folder structure.

### Negative
* **Repository Noise:** Created 7 initial commits solely for placeholder management.
* **Cleanup Required:** These files had to be manually deleted once the actual code was implemented.

## Superseded
None
