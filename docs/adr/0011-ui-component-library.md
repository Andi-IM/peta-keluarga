# ADR 0011: UI Component Co-location and Library Integration

**Date:** 2026-06-02
**Status:** Accepted

## Context

A rich set of accessible UI primitives is required to build the sidebar and navigation menus.

## Decision

In Commit `19c3bf3`, we imported a comprehensive set of 57 UI components.

1. **Flat Structure:** We decided to keep these components in the project's root directory for the initial development phase to simplify imports and visibility.
2. **Standard primitives:** Included `accordion`, `dialog`, `select`, `sidebar`, and others from the Radix-based ecosystem.

## Consequences

### Positive

* **Development Velocity:** Having all primitives immediately available allowed for the rapid assembly of the sidebar panels.
* **Component Coverage:** Ensures almost any standard UI pattern can be implemented without adding new files later.

### Negative

* **Massive File Count:** Adding 57 files in one commit makes code review difficult.
* **Root Clutter:** Placing UI components in the root is an architectural trade-off that will eventually require refactoring into a `components/ui/` folder for better scalability.

## Superseded

None
