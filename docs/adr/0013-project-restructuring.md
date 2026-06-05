# ADR 0013: Project Restructuring and Standardization

**Date:** 2026-06-02
**Status:** Accepted

## Context

The project initially followed a flat structure with over 50 UI components co-located in the root directory (as documented in ADR 6). While this facilitated rapid prototyping, it hindered maintainability, violated standard Next.js conventions, and led to a cluttered root workspace. Additionally, several visual assets were duplicated between the root and the `public/` directory.

## Decision

We have restructured the project as follows:

1. **UI Components:** Moved all 55+ UI components (e.g., `button.tsx`, `card.tsx`) from the root to `components/ui/`.
2. **Hooks:** Moved `use-mobile.tsx` and `use-toast.ts` to the `hooks/` directory, resolving redundant duplicates.
3. **Asset Cleanup:** Removed all brand and placeholder assets from the root directory, centralizing them in `public/`.
4. **Git Standard:** Established a comprehensive `.gitignore` file to exclude `node_modules`, `.next`, build artifacts (`out`), and local environment files.

## Consequences

### Positive

* **Scalability:** The root directory is now clean, containing only configuration files, making it easier to navigate the project.
* **Conventional Alignment:** Moving components to `components/ui/` aligns with the industry-standard Shadcn/Next.js architecture.
* **Reduced Noise:** The source tree no longer contains redundant assets or platform-specific metadata (e.g., `.DS_Store`).

### Negative

* **Path Refactoring:** Any future imports of these components must now use the `@/components/ui/` prefix instead of the root-level path.

## Superseded

* **ADR 6 (Full):** The flat file structure for UI components is no longer in use.
* **ADR 1 (Partial):** Placeholders and root-level structures have been fully replaced by a conventional directory model.
