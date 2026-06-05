# ADR 0001: Foundational Technology Stack and Project Structure

**Date:** 2026-06-02
**Status:** Accepted

## Context

The project requires a robust framework to visualize a large, complex network of family relationships (genealogical data) with high interactivity. The data consists of thousands of Indonesian familial records, necessitating efficient rendering and a responsive UI.

## Decision

We have established the following foundational technologies and structural patterns:

1. **Framework:** [Next.js 16](https://nextjs.org/) with React 19 and App Router for modern server-side rendering and routing.
2. **Styling:** [Tailwind CSS 4.2.0](https://tailwindcss.com/) for utility-first styling with the latest engine features.
3. **Visualization:** [vis-network](https://github.com/visjs/vis-network) for interactive graph rendering.
4. **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives for accessible components, with a flat structure co-located in the root directory for direct visibility during the initial development phase.
5. **CI/CD:** GitHub Actions (`nextjs.yml`) for automated builds and deployment to Vercel.

## Consequences

### Positive (Benefits)

* **High Performance:** Next.js and vis-network provide a smooth experience for large datasets.
* **Modern Tooling:** Utilizing Tailwind 4 and React 19 ensures long-term support and access to the latest web capabilities.
* **Accessibility:** Radix UI ensures the interface is usable for all.
* **Rapid Prototyping:** The flat structure allows for quick access to all UI building blocks without deep nested navigation.

### Negative (Trade-offs/Risks)

* **Root Clutter:** Placing 50+ UI components in the project root is unconventional and will require refactoring as the project complexity increases.
* **Bleeding Edge:** Using Next.js 16 and Tailwind 4 shortly after release may involve encountering undocumented behaviors or breaking changes in early patch versions.
* **Maintenance:** `vis-network` is powerful but has a steep learning curve for complex custom styling compared to SVG-based alternatives like D3.

## Superseded

None (Initial Architecture)
