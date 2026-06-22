# Stack Decisions

Decision timestamp: 2026-06-19T21:32:53+0100.

## Current Stack

- Static HTML, CSS, and JavaScript power the local desktop component app. The surface is small, dependency-free, inspectable, and easy to package later.
- A small Python emitter powers the Linux Waybar integration. Python is commonly available on target systems, emits Waybar JSON cleanly, and avoids a resident desktop process.
- A shell installer copies one executable script and creates one config file. That matches the Unix expectation of explicit files in user-owned paths.

## Native Packaging Direction

- Tauri is the preferred wrapper for Linux, Windows, and macOS desktop packaging if a native shell is added. It can reuse the existing UI while staying lighter than Electron.
- SwiftUI plus WidgetKit is the Apple path for iOS widgets and Apple silicon Mac compatibility.
- The calculation core should remain portable and small so every native surface can share the same behavior.

## Rejected Weight

- Electron is too heavy for a tray countdown and contradicts the minimal system-widget ethos.
- A backend service is unnecessary. The widget should run locally, keep health-adjacent inputs private, and avoid runtime network dependency.
- A frontend framework is not needed for the current component count. Explicit DOM code is easier to audit and package here.
- Account systems, sync, analytics, and gamified dashboards are intentionally absent. The clock is already rude enough.
