# ADR 0015: State-Driven Clustering Stability

## Status

Accepted

## Context

The `NetworkGraph` component previously attempted to manually manipulate the `vis-network` instance (clustering and opening clusters) inside event handlers (`handleClusterAll`, `handleExpandAll`) while also updating React state (`clusteredView`).

This dual-mode approach caused:

1. **Race Conditions**: React's state update triggered a full re-initialization of the network via `useEffect`, which collided with the manual instance modifications happening in the same turn.
2. **Log Flooding**: The manual logic called `network.isCluster(nodeId)` on IDs that were no longer present in the network (e.g., expanded clusters). `vis-network` throws a "Node does not exist" error when this happens, filling the Next.js console with hundreds of error lines.

## Decision

We will shift to a strictly state-driven approach for global clustering actions and implement defensive existence checks for individual node queries.

1. **Prefer State over Manual Manipulation**: Global actions like "Cluster All" or "Expand All" will only update React state. We will rely on the `useEffect` cleanup and re-initialization to provide a clean, consistent network state.
2. **Defensive Existence Checks**: All calls to `network.isCluster(nodeId)` must be preceded by an existence check (e.g., `network.getPositions([nodeId])`) to avoid library-level errors for nodes that might have been removed or expanded.

## Consequences

- **Stability**: Eliminates the "Node does not exist" crashes and log flooding.
- **Predictability**: The network state is always derived from React state, making it easier to reason about.
- **Performance**: While full re-initialization is slightly more expensive than incremental updates, for the current data scale (500+ nodes), it ensures correctness and avoids the complexity of manual delta management.

## Superseded

None
