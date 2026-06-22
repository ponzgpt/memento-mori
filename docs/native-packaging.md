# Native Packaging Requirements

This document defines the line between source-installable artifacts and paid convenience installers. The source can be useful today; signed native distribution needs platform credentials, installer QA, and a little less optimism.

## Release Rule

Do not describe an artifact as a signed native installer unless the platform checklist below is complete and the artifact is listed in `release-manifest.json`.

The paid installer sells packaging convenience, not hidden functionality, medical accuracy, actuarial certainty, or support entitlement. Source code remains Apache-2.0 and forkable.

## macOS

A macOS convenience release should be a signed `.dmg` or `.pkg`.

Required before calling it signed/native:

- Developer ID Application certificate for the app bundle.
- Developer ID Installer certificate when shipping a `.pkg`.
- Hardened runtime enabled where applicable.
- Notarization accepted by Apple.
- Stapling completed for the shipped artifact.
- Gatekeeper smoke test on a clean macOS account.
- App installs into `/Applications` or a clearly documented user-local location.
- Menu-bar item launches without opening a browser by surprise.
- Uninstall path documented and tested.
- Countdown works without a runtime network dependency.
- Privacy boundaries match `PRIVACY.md`.

The current macOS source installer compiles a native Swift menu-bar app into a user-local app bundle. That is useful for testing the actual menu-bar behavior, but it is not a signed or notarized installer.

## Windows 11

A Windows convenience release should be a signed `.exe` or `.msi`.

Required before calling it signed/native:

- Authenticode signing certificate applied to the installer and executable payload.
- Signature verification documented in release notes.
- SmartScreen reputation caveat stated until publisher reputation exists.
- Per-user install by default, or explicit consent for machine-wide install.
- Start Menu entry and uninstall path tested.
- Start-on-login remains opt-in.
- Tray utility launches without requiring a terminal.
- Countdown works without a runtime network dependency.
- Privacy boundaries match `PRIVACY.md`.

The current Windows source installer creates a Start Menu shortcut over the local component app. That is useful, but it is not a signed executable or MSI.

## Linux

Linux remains the reference path through the Waybar-compatible JSON module.

Convenience releases may add:

- AppImage for desktop-shell users.
- Native packages such as `.deb`, `.rpm`, or Arch package recipes.
- Signed checksums or repository metadata when distribution moves beyond GitHub Releases.

Required before calling a package native-ready:

- Package installs files under documented paths.
- Uninstall removes installed files cleanly.
- Waybar JSON output stays compatible with the documented `custom/memento-mori` module.
- User config stays under `~/.config/memento-mori`.
- Countdown works without a runtime network dependency.

## iOS

iOS distribution requires Apple tooling rather than the current web component app.

Required before calling it iOS-ready:

- SwiftUI app source exists.
- WidgetKit extension source exists.
- TestFlight build available for testing, or App Store build available for public release.
- App Privacy labels align with `PRIVACY.md`.
- No runtime countdown network dependency.
- Local profile storage and deletion path documented.
- Apple silicon Mac availability is explicitly allowed or disabled.
- Lock Screen and Home Screen widgets use the same model semantics as the desktop widget.

Until those requirements are met, iOS stays a documented platform direction.

## Verification

Every release still starts with the canonical gate:

```sh
npm run verify
```

For signed native releases, add platform-specific smoke tests:

- Install on a clean account.
- Launch the tray/menu/widget surface.
- Confirm the countdown includes seconds.
- Toggle bone/ash and onyx.
- Open and edit the settings panel.
- Confirm profile data stays local.
- Uninstall and confirm installed files are removed.
- Verify checksums against `SHA256SUMS`.
- Confirm `release-manifest.json` lists the exact artifact name, size, SHA-256 digest, and platform readiness.

Small software should still tell the truth. Especially the one with a death clock.
