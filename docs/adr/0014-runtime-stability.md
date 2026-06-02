# ADR 0014: Runtime Stability and Defensive Canvas Interaction

**Date:** 2026-06-02
**Status:** Accepted

## Context
During development, the `vis-network` graph was prone to `TypeError: Cannot read properties of undefined (reading 'fit')`. This occurred because asynchronous calls to the `.fit()` method were firing after the component had been destroyed or re-initialized (e.g., during Fast Refresh), leading to attempts to access a non-existent canvas or internal network state.

## Decision
We implemented a robust defensive strategy in `components/network-graph.tsx`:
1. **Guarded Fit Function:** Created a `safeFit` helper that verifies the existence of both the `network` instance and its DOM `containerRef.current` before executing.
2. **Lifecycle Management:** Rely on explicit null checks and a `try/catch` block for safety. (Note: The `isDestroyed` check was removed as it is not part of the public `vis-network` API).
3. **Timeout Lifecycle Management:** Used a `fitTimeoutRef` to track and clear any pending `setTimeout` calls when the component unmounts or re-initializes.
4. **Exception Handling:** Wrapped the `.fit()` call in a `try/catch` block to prevent any remaining edge cases from crashing the application.

## Consequences
### Positive
* **Runtime Reliability:** Eliminates the frequent console errors and potential crashes during development and production.
* **Smooth UX:** Ensures the "Fit to View" animation only occurs when the graph is in a valid state to do so.

### Negative
* **Increased Complexity:** Adds boilerplate code for lifecycle management and state checking.
* **Overhead:** Slight performance cost for additional validation checks, though negligible compared to the cost of a runtime error.

## Superseded
* **ADR 3 (Partial):** Updates the internal implementation details of the `NetworkGraph` component described in ADR 3.
