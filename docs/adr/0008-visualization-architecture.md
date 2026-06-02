# ADR 0008: Network Visualization Architecture

**Date:** 2026-06-02
**Status:** Accepted

## Context
The primary goal of the application is to visualize complex family relationships. This requires a separation between the interactive canvas and the informational panels.

## Decision
In Commit `c2f2f52`, we implemented the core component architecture:
1. **Container Pattern:** `family-network-app.tsx` acts as the main orchestrator.
2. **Graph Engine:** `network-graph.tsx` encapsulates the `vis-network` logic.
3. **UI Composition:** `sidebar-panels.tsx` handles node details, search, and stats, keeping the graph implementation clean.
4. **Theming:** `theme-provider.tsx` for consistent dark/light mode support across the visualization components.

## Consequences
### Positive
* **Modular Logic:** The graph logic is decoupled from the UI controls, making it easier to swap or update the visualization engine.
* **Component-Driven State:** Using React state to manage node/cluster selection between the graph and sidebar.

### Negative
* **Client-Side Heavy:** The visualization and its controls are entirely client-side, which may affect initial load performance.

## Superseded
None
