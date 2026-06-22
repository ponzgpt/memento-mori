# Install And Use

Memento Mori has two distribution paths:

- Source: Apache-2.0 code for users who want to inspect, build, adapt, fork, or install the widget themselves.
- Convenience installer: release artifacts for users who prefer a downloadable executable or package. The paid value is packaging, signing, defaults, and setup polish, not hidden functionality.

The software is provided as-is. There is no support entitlement. Issues and pull requests are welcome when they fit the project direction; forks are allowed.

## Linux

### Source Install

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
./install.sh
```

This installs:

- `~/.local/bin/memento-mori-waybar`
- `~/.config/memento-mori/config.json`

Add the custom module to your bar config. For Waybar:

```jsonc
"custom/memento-mori": {
  "exec": "python3 ~/.local/bin/memento-mori-waybar --config ~/.config/memento-mori/config.json",
  "interval": 1,
  "return-type": "json",
  "format": "MM {}",
  "tooltip": true
}
```

Copy or adapt `waybar/style.example.css` into your bar stylesheet.

Smoke test:

```sh
python3 ~/.local/bin/memento-mori-waybar --config ~/.config/memento-mori/config.json
```

Expected output is one JSON object with `text`, `tooltip`, `class`, and `percentage`.

### Release Artifact

Linux release artifacts should be attached to GitHub Releases:

- `memento-mori-linux-waybar-*.tar.gz` for the Waybar script, example config, and styles.
- Optional AppImage or native package when a desktop shell is published.

The one-command source install remains the reference path for technical users.

## macOS

### Release Artifact

macOS distribution should use a signed and notarized `.dmg` or `.pkg` when published. The installer should place the app in `/Applications`, expose a menu-bar item, and provide a clear uninstall path.

Paid distribution should use Stripe checkout on the product site or newsletter landing page. GitHub Releases can still host public source archives and early unsigned artifacts when useful.

### Source Run

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
npm run serve
```

Open `http://127.0.0.1:4173`.

This runs the local desktop component app for visual and behavioral inspection. The native macOS shell should use SwiftUI/AppKit or a small Tauri wrapper while preserving the same calculation model and copy.

The source release artifact for the local component app is:

- `memento-mori-local-app-*.tar.gz`

## Windows 11

### Release Artifact

Windows distribution should use a signed `.exe` or `.msi` when published. The app should install as a tray utility, start on login only when the user opts in, and include an ordinary uninstall path.

Paid distribution should use Stripe checkout. GitHub Releases can host public source archives and early installer artifacts.

### Source Run

```powershell
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
npm run serve
```

Open `http://127.0.0.1:4173`.

This runs the local desktop component app. The native Windows shell should keep the tray surface compact: `MM`, countdown, integrated progress, and a single context-menu palette toggle.

The source release artifact for the local component app is:

- `memento-mori-local-app-*.tar.gz`

## iOS

### Distribution

iOS distribution should use Apple tooling: TestFlight for pre-release testing and App Store distribution for public releases. GitHub remains the home for source code, release notes, and platform documentation.

### Source Direction

The native implementation should use SwiftUI plus WidgetKit:

- app icon based on the bone-hourglass mark
- Lock Screen and Home Screen widgets
- compact `MM` countdown surface
- one setup screen with the same fields as the desktop panel
- no runtime network dependency for the countdown

See [apple-platform-plan.md](apple-platform-plan.md).

## Local Profile

The example profile lives at `config/profile.example.json`. A user profile should stay local and can be edited by hand:

```json
{
  "birth_date": "1992-06-19",
  "birth_country": "WLD",
  "current_country": "WLD",
  "move_age": 0,
  "skin": "system-light"
}
```

Do not put medical history, private diagnoses, or personal documents in public issues. The model is approximate and reflective only.
