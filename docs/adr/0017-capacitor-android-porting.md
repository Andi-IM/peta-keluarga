# ADR 0017: Android Native Porting with CapacitorJS

## Status

Accepted

## Context

The `peta-keluarga` application is currently a Next.js web application. To expand user accessibility and provide a native mobile experience on Android, we need to port the application to Android. The application relies on client-side interactive rendering (vis-network graph visualization), which requires standard web APIs. We selected CapacitorJS due to its seamless integration with modern web applications and native plugins, enabling the web app to run directly inside a native Android WebView without complex changes.

## Decision

We will integrate CapacitorJS into the project, configure Next.js for a static export, and establish a native Android build workflow.

1. **Next.js Static Export Configuration**:
   - Update `next.config.mjs` to include `output: 'export'` to generate a static HTML/JS/CSS bundle in the `out/` folder upon build.
   - Configure `images: { unoptimized: true }` to avoid external image optimization requirements, which are incompatible with static exports.

2. **Capacitor Dependencies**:
   - Install `@capacitor/core`, `@capacitor/android` as standard dependencies and `@capacitor/cli` as a devDependency.

3. **Capacitor Configuration (`capacitor.config.ts`)**:
   - Set the `appId` to `com.andii.petakeluarga`.
   - Set the `appName` to `Peta Keluarga`.
   - Configure `webDir` to point to `out` (the Next.js export directory).
   - Use the `https` scheme for Android WebViews to maintain standard security contexts.

4. **Android Native Project Integration**:
   - Add the native Android platform structure using `npx cap add android` to generate the `android/` directory containing the Gradle build files and Android studio project.

5. **Workflow Automation Scripts**:
   - Add the following command scripts in `package.json` for easy native integration:
     - `"cap:sync"`: Runs `next build && cap sync` to build the latest web assets and copy them to `android/app/src/main/assets/public`.
     - `"cap:open"`: Runs `cap open android` to open the Android native project in Android Studio.
     - `"cap:run"`: Runs `cap run android` to deploy and run the app directly on a connected device/emulator.

## Consequences

- **Unified Codebase**: Both the web and native Android apps are built from a single codebase, preserving the Stellarium-style dark space theme, celestial grid, and constellation physics layout across all platforms.
- **Offline Capabilities**: Since Next.js is statically exported into the native assets, the app can run fully offline on Android devices.
- **Client-Side Compatibility Requirement**: All pages and interactive layouts must remain client-side compatible (i.e. utilizing standard client-side components and avoiding dynamic Server-Side Rendering (SSR) or server-only dynamic routes).
- **Simplified Development Cycle**: Web assets can be rebuilt and synchronized to the native app with a single `pnpm run cap:sync` command.

## Superseded

- **ADR 2 (Partial):** Modifies the build output target of the Next.js application to static HTML exports ('export') to facilitate native offline loading.
