# ADR 0003: Family-Centric Data Modeling and Grouping

**Date:** 2026-06-02
**Status:** Accepted

## Context
The raw family data is a flat list of relationships (`person` -> `related_to`). Visualizing this directly for thousands of entries results in an unreadable "hairball" graph. We need a way to logically group individuals into family units (clusters).

## Decision
We implemented a custom grouping algorithm in `lib/network-utils.ts`:
1. **Relationship Mapping:** Define four primary types: `bapak`, `ibu`, `pasangan`, and `anak`.
2. **Connected Components:** Use a connected-components approach to group people who have any direct or indirect relationship.
3. **Dynamic Naming:** Automatically name clusters as "Keluarga [Surname/Head]" by identifying the most connected node (highest degree) in each component.
4. **Color Coding:** Assign distinct colors to nodes based on their family group to provide visual separation even when clusters are expanded.

## Consequences
### Positive (Benefits)
* **Visual Clarity:** Users can immediately identify distinct family lineages.
* **Semantic Discovery:** The naming logic helps users navigate the graph based on prominent family figures (e.g., "Keluarga Hatta").
* **Scale Management:** Grouping allows for higher-level abstractions (clusters) before diving into individual nodes.

### Negative (Trade-offs/Risks)
* **Computational Overhead:** Processing connected components on the client side may lag with extremely large datasets (>10k nodes).
* **Naming Accuracy:** Surnames are inferred from the last part of a string, which may be inaccurate for diverse naming conventions.

## Superseded
None
