# ADR 0018: Data Normalization and Pre-Indexed Lookup Maps

## Status
Accepted

## Context
As the family relationship dataset (`familyData`) grew to 500 entries, two main performance issues emerged:
1. **Redundant Bidirectional Data**: The array contained symmetrical declarations (e.g., spouse relationships declared both ways, and child relationships declared alongside father/mother relationships). This caused `vis-network` to draw overlapping duplicate edges, increasing canvas rendering overhead and inflating connections count.
2. **O(N) Render Loop Scans**: The `NodeInfoPanel` component performed linear `.filter()` scans over the 500-item array in the React render cycle every time a node was selected or updated. Additionally, the `SearchPanel` recalculated and sorted unique names on mount.

To ensure smooth mobile rendering (particularly for the Android port) and instant UI responses, we need to normalize the relation data and precompute lookups.

## Decision
We will normalize the relationship data at the module level when `family-data.ts` loads, and export pre-computed indexing structures for $O(1)$ UI lookups.

1. **Dynamic Data Normalization**:
   - Filter out all `"anak"` relationships since they are fully redundant with the existing `"bapak"` and `"ibu"` records.
   - Deduplicate `"pasangan"` (spouse) relationships to keep only one record per married couple (by sorting names alphabetically and keeping a single key).
   - Export the cleaned-up array as `familyData`.

2. **Pre-Indexed Lookup Tables**:
   - Build a `personRelationsLookup` map at the module level where each person has pre-computed arrays for `fathers`, `mothers`, `spouses`, and `children`.
   - Collect and sort all unique names into `allUniqueNames` once upon module load.

3. **O(1) UI Component Access**:
   - Update `NodeInfoPanel` in `sidebar-panels.tsx` to retrieve information directly from `personRelationsLookup[selectedNode]` in $O(1)$ time instead of running multiple filter scans.
   - Update `SearchPanel` in `sidebar-panels.tsx` to reference the pre-sorted `allUniqueNames` directly.

## Consequences
- **Canvas Rendering Optimization**: Graph edges are reduced from 500 to ~360. Duplicate overlapping lines are eliminated, significantly reducing the drawing cost in `vis-network` and increasing rendering frame rate during pan/zoom.
- **Instant UI Selection**: Selecting a family member displays their info panel immediately because linear array scans are replaced with instant hash-map lookups.
- **No Data Loss**: Connectivity is fully preserved since the removed relationships were mathematically redundant.

## Superseded
* **ADR 3 (Partial):** Normalizes the relationship data array (removing redundant "anak" and spouse entries) and introduces pre-computed lookups.
