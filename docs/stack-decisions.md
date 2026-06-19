# Stack Decisions

Decision timestamp: 2026-06-19T21:32:53+0100.

## Current MVP

- Static HTML/CSS/JS is the right co-development workbench for now. It keeps the preview portable, dependency-free, and easy to inspect. It is not the product runtime.
- A small Python Waybar emitter is the right Linux MVP integration. Python is already present on most target machines, emits Waybar JSON cleanly, and avoids a resident desktop process.
- Plain shell install is acceptable for technical users. It copies one executable script and creates one config file, which matches the Unix expectation of explicit files in user config paths.

## Later Native Shells

- Tauri remains the best near-term wrapper for Linux, Windows, and macOS desktop packaging because it can reuse the web workbench UI while keeping native installers small.
- SwiftUI plus WidgetKit is the best Apple path for iOS widgets and Apple silicon Mac compatibility. The Apple surface should not be a web wrapper if it becomes a real paid consumer product.

## Rejected For Now

- Electron is too heavy for a tray countdown and contradicts the minimal system-widget ethos.
- A backend service is unnecessary. The widget should run locally, keep health-adjacent inputs private, and avoid runtime network dependency.
- A frontend framework is premature. The component count is small, and the MVP benefits more from explicit DOM code than a build pipeline.
