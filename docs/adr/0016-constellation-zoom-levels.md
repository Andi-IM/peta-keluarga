# ADR 0016: Constellation Visuals and Dynamic Zoom-Based Labeling

## Status

Accepted

## Context

The family network graph represents complex relationships and multiple family clusters. The previous visualization used a standard layout with solid edge colors and static label visibility. When users zoomed out to view the entire family structure, the text labels of all nodes overlapped and cluttered the screen, making it impossible to identify macro hierarchy patterns or the geometric layout of the family groups. To solve this, we need a theme that is visually clean at a distance and highly detailed when viewed closely, evoking a "constellation" (rasi bintang) feel where clusters form star systems.

## Decision

We will transition the graph visualization to a space-inspired constellation theme, layout nodes organically in a spiral celestial dome, and implement state-driven, dynamic levels of detail based on zoom scale.

1. **Space Theme Canvas**: Set the graph canvas background to a deep space environment (gradient, blur nebulas, and an SVG starfield). Make the `vis-network` canvas transparent to overlay beautifully on top of this background.
2. **Stellarium Celestial Grid**:
   - Draw an interactive sky map grid directly onto the canvas using the `beforeDrawing` canvas context.
   - The grid consists of concentric altitude rings (labeled with astronomical light years, e.g. `250 ly`, `500 ly`) and radial azimuthal coordinates (labeled in degrees, e.g. `0°`, `30°` ... `330°`).
   - The grid elements scale and pan dynamically with the user's view, creating a realistic celestial mapping viewport.
3. **Stellarium-Inspired Organic Layout**:
   - **Barnes-Hut Physics**: Enable standard force-directed layout simulation to organically clump family systems and let them repel disconnected families, forming separate, floating constellations.
   - **Golden Spiral (Fermat's Spiral) Initial Positioning**: Arrange family cluster centers using Fermat's Spiral equations. Sort clusters by size in descending order, so the largest family clusters occupy the center of the celestial sphere (gravitational core), while smaller ones spiral outward.
4. **Constellation Styling**:
   - **Nodes (Stars)**: Style nodes as glowing stars with a white core, a border colored by their family group, and a glow shadow matching the family group color. Anchor nodes (highly connected members or family heads) will be scaled larger.
   - **Edges (Constellation Lines)**: Change relationship lines to thin, semi-transparent colored lines that look like faint constellation connections. Spouses will be connected by dotted/dashed lines with no directional arrows.
   - **Clusters (Galaxies)**: Style collapsed family cluster nodes as large, glowing galactic hubs with extra glow shadows and white text with dark strokes.
5. **Zoom-Based Levels of Detail (LoD)**:
   Implement three zoom levels based on scale thresholds (`far` for scale < 0.35, `medium` for 0.35 <= scale < 0.8, and `close` for scale >= 0.8):
   - **Far**: Hide all node labels except for highly-connected "anchor" stars. Hide all edge labels. Reduce edge thickness and opacity to make the constellation patterns clean.
   - **Medium**: Show all node labels in a small font size with low opacity. Hide edge labels.
   - **Close**: Show all node labels at full brightness and size. Show edge labels (relationship types like "bapak", "ibu", etc.) clearly.
6. **Performance-Friendly State Transitions**:
   Only trigger updates to `nodesDataSet` and `edgesDataSet` when the scale crosses a zoom threshold boundary, ensuring standard zooming and dragging remain fluid (60fps). Disable the loading overlay spinner only when the physics engine completely stabilizes (`stabilizationFinished`).

## Consequences

- **Improved Hierarchy Recognition**: Macro patterns are instantly recognizable when zoomed out because text clutter is eliminated, highlighting the geometric shape of the family tree.
- **Micro-Detail Access**: Text labels and relationship types appear automatically as the user zooms in on a specific family branch.
- **Premium Aesthetics**: The high-contrast, glowing neon stars on a cosmic background provide an engaging, modern, and polished user experience.
- **Performance**: The network library only redraws node/edge properties when transitioning between the three zoom states, preventing constant updates during continuous zoom gestures.

## Superseded

- **ADR 8 (Partial):** Updates the styling and layout algorithms of the network visualization graph.
