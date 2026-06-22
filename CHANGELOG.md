# Changelog

All notable changes are tracked here. The format follows Keep a Changelog conventions loosely, with SemVer as the release versioning scheme.

## 1.0.0 - 2026-06-22

Initial source-installable release.

### Added

- Local Memento Mori countdown widget with years, days, hours, minutes, and seconds.
- Waybar-compatible Linux JSON module with tooltip, CSS classes, and progress percentage.
- Local component app with tray/bar previews, settings panel, contextual menus, reflection prompt, and bone/ash plus onyx palettes.
- Deterministic life-expectancy model using birth date, birth country, current country, residence age, and coarse local lifestyle rows.
- Auditable model-data document listing exact baseline and offset values.
- Apache-2.0 source distribution with no accounts, analytics, cloud sync, or runtime countdown API.
- Privacy policy documenting local profile data, runtime network boundaries, and deletion paths.
- Source installers for macOS and Windows backed by the local component app.
- iOS and Apple-platform direction for a future SwiftUI and WidgetKit implementation.
- GitHub Actions verification and release workflows.
- Release artifacts for the Linux Waybar module and local desktop component app.
- Machine-readable release manifest with artifact checksums and platform readiness.
- Native packaging checklist for signed macOS, signed Windows, Linux package, and iOS distribution readiness.
- Production-readiness matrix for release scope, shipping labels, and final gate evidence.

### Verified

- `npm run verify`
- `npm run audit`
- `npm run lint`
- `npm test`
- `npm run check:installers`
- `npm run check:production`
- `npm run check:release`
- `npm run check:version`
- `npm run check:web`
- SHA-256 checksum generation and verification for packaged artifacts.

### Platform Readiness

- Linux: ready as a Waybar-compatible custom JSON module.
- macOS: source-installable app bundle; signed/notarized installer is not part of this release gate.
- Windows 11: source-installable Start Menu launcher; signed executable or MSI is not part of this release gate.
- iOS: documented direction only.

### Notes

- The estimate is approximate and reflective. It is not medical, legal, actuarial, insurance, or mental-health advice.
- The software is provided as-is. Community pull requests and forks are welcome under Apache-2.0.
