# ADR 4: Data Processing and Utility Decoupling

**Date:** 2026-06-02
**Status:** Accepted

## Context
Genealogical data is naturally complex. To ensure the graph remains readable and the application remains performant, we need to process raw relationship data before rendering.

## Decision
In Commit `cba8ad5`, we established the data layer:
1. **Raw Data Storage:** `lib/family-data.ts` contains the static relationship array.
2. **Logic Separation:** `lib/network-utils.ts` implements the clustering, coloring, and node/edge generation logic.
3. **Core Helpers:** `lib/utils.ts` for shared Tailwind utility functions.

## Consequences
### Positive
* **Maintainability:** The raw data can be updated or replaced (e.g., from an API) without touching the rendering logic.
* **Algorithm Isolation:** The clustering algorithm (connected components) is isolated in a utility file, making it independently testable.

### Negative
* **Large Data Payload:** Including the 46KB dataset in the main bundle increases the initial JS size.

## Superseded
None
