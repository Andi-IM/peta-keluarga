# ADR 5: Component Organization and Styling System

**Date:** 2026-06-02
**Status:** Accepted

## Context
The project needs a robust set of UI components (buttons, cards, inputs) to support the visualization interface, and these must be easily accessible during the early phases of development.

## Decision
1. **Flat File Structure:** All 50+ base UI components are stored directly in the project root instead of a `components/ui` subdirectory.
2. **PostCSS with Tailwind 4:** Uses `@tailwindcss/postcss` for the styling pipeline.
3. **Iconography:** Standardized on `lucide-react` for all interface icons.
4. **Theme Management:** Uses `next-themes` to support dark/light modes, with colors derived from a centralized `relationshipColors` map to maintain semantic consistency.

## Consequences
### Positive (Benefits)
* **Development Velocity:** Quickest possible access to component code without deep directory traversal.
* **Consistency:** Centralizing relationship colors ensures the sidebar, legend, and graph are always in sync.
* **Modern CSS:** Leveraging Tailwind 4's new engine reduces build times and simplifies configuration.

### Negative (Trade-offs/Risks)
* **Project Organization:** The root directory is extremely cluttered, making it difficult to find non-component files.
* **Refactoring Debt:** Eventually, these components will need to be moved to `components/ui` to follow standard Next.js/Shadcn patterns.

## Superseded
None
