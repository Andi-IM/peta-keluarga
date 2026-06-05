# ADR 0019: Physics Stabilization Loading Progress UX

## Status

Accepted

## Context

During physics engine initialization, the graph simulation stabilizes in the background to arrange nodes organically. While this simulation runs, the application displays a loading screen ("Memuat Rasi Bintang...") to prevent interaction with an unstable layout.

To improve user feedback, we decided to show the exact loading percentage. However, because `vis-network` dynamically increases the total iterations required to reach layout equilibrium during simulation, the calculated progress percentage (`iterations / total`) fluctuates up and down, causing the progress bar to move backwards and appear glitchy.

## Decision

We will implement a monotonic progress update mechanism, cap progress until finalized, and enforce deterministic initialization.

1. **Monotonic Progress Logic**:
   - Update `loadingProgress` using a functional state updater with `Math.max(prev, percent)` to guarantee the progress bar only moves forward or stalls, never decreasing.

2. **Progress Capping**:
   - Cap progress at `99%` during the callback. The progress bar will only reach `100%` when the loading state is fully finalized.

3. **Guarded Async Finalization**:
   - Create a `finishLoading` function with a boolean guard flag (`loadingFinished`). This function sets the loading progress to `100%` and hides the loader.
   - Listen to both `'stabilized'` and `'afterDrawing'` events, calling `finishLoading` on whichever fires first. The guard flag prevents double-initializing clustering and layout calculations.

4. **Visual Aesthetics**:
   - Replace the loading spinner with a glassmorphic progress bar using a cosmic gradient (`from-sky-500 via-indigo-500 to-purple-500`) and a glowing cyan shadow to align with the Stellarium design theme.

## Consequences

- **Consistent Visual Feedback**: The progress bar fills smoothly and monotonically, eliminating confusing back-and-forth movement.
- **Deterministic Component Setup**: Initial clustering and zoom fit execute exactly once, preventing double-drawing and UI jumpiness.
- **Strict Type Safety**: Using the typed `'stabilized'` event from `vis-network` ensures error-free TypeScript compilation.

## Superseded

- **ADR 16 (Partial):** Updates the loading stabilization completion handling to use the guarded `finishLoading` pattern and dynamic progress tracking.
