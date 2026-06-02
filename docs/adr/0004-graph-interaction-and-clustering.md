# ADR 0004: Graph Interaction and Hierarchical Clustering

**Date:** 2026-06-02
**Status:** Accepted

## Context
With hundreds of individuals per family, displaying all nodes simultaneously causes performance degradation and visual cognitive overload.

## Decision
We implemented a hierarchical interaction model in `components/network-graph.tsx`:
1. **Initial Clustered View:** The graph loads with all family groups collapsed into single "Cluster Nodes".
2. **Double-Click Expansion:** Users expand a family group by double-clicking the cluster node.
3. **Contextual Collapse:** Double-clicking an individual node collapses its entire family back into a cluster.
4. **Grid Positioning:** Clusters are positioned in a 600px-spaced grid to prevent overlap between unrelated families.
5. **Physics-Free Layout:** Standard physics are disabled (`physics: { enabled: false }`) in favor of manual positioning logic to ensure a stable and predictable view.

## Consequences
### Positive (Benefits)
* **Performance:** Significantly reduces the number of active nodes and edges the DOM/Canvas must track.
* **UX Stability:** Prevents the "exploding graph" effect common in force-directed layouts.
* **Focused Exploration:** Users can choose to "drill down" into one family without being distracted by others.

### Negative (Trade-offs/Risks)
* **Discoverability:** New users may not realize clusters can be expanded via double-click without explicit UI hints.
* **Manual Layout Complexity:** Disabling physics means we must manually calculate all node/cluster coordinates, which increases logic complexity.

## Superseded
None
