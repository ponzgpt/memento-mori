# Install And Use

This is the canonical GitHub install guide for Memento Mori.

Memento Mori has two distribution tracks:

- Beta executable or installer: free GitHub Release artifacts during beta so the product can be tested on real machines. Later this becomes the cheap paid convenience installer sold through Stripe.
- Source code: Apache-2.0 source for technical users who want to inspect, build, fork, or install it themselves.

Current production status:

| Platform | Production-testable now | Notes |
| --- | --- | --- |
| Linux status/tray | Yes | Waybar custom module is the reference implementation. Other bars can adapt the JSON emitter. |
| macOS menu bar | Partial | Component preview exists. Native menu-bar wrapper is planned. |
| Windows 11 system tray | Partial | Component preview exists. Native tray wrapper is planned. |
| iOS widgets | Planned | SwiftUI and WidgetKit path is documented, but no iOS target is shipped yet. |

The product is provided as-is. There is no support entitlement. Issues and PRs are welcome when they fit the project direction; forks are allowed.

## Linux

### Beta executable or installer

During beta, Linux release artifacts should be attached to GitHub Releases for free testing. Target artifacts:

- `memento-mori-linux-*.tar.gz` for the Waybar module and example config
- AppImage or native package later, if a desktop shell is added

Until those artifacts exist, use the source install below. It is the production-testable Linux path today.

### Source install

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
./install.sh
```

Create or inspect the profile:

```sh
mkdir -p ~/.config/memento-mori
python3 ~/.local/bin/memento-mori-waybar --sample-config > ~/.config/memento-mori/config.json
```

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

Copy or adapt the styles in `waybar/style.example.css`.

Smoke test:

```sh
python3 ~/.local/bin/memento-mori-waybar --config ~/.config/memento-mori/config.json
```

The command should emit one JSON object with `text`, `tooltip`, `class`, and `percentage`.

## macOS

### Beta executable or installer

The target beta artifact is a signed or ad-hoc signed `.dmg` or `.pkg` published in GitHub Releases for free testing. The later paid version should use the same core source with installer polish and notarization.

This artifact is not shipped yet.

### Source build

Today macOS can run the component workbench for design and behavior testing:

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
npm run serve
```

Open `http://127.0.0.1:4173`.

Native macOS menu-bar production work should use SwiftUI/AppKit or a Tauri shell later. The source path is intentionally not pretending to be a finished menu-bar app yet.

## Windows 11

### Beta executable or installer

The target beta artifact is a `.exe` or `.msi` attached to GitHub Releases for free testing. The later paid version should be distributed through Stripe as a convenience installer.

This artifact is not shipped yet.

### Source build

Today Windows can run the component workbench for design and behavior testing:

```powershell
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
npm run serve
```

Open `http://127.0.0.1:4173`.

Native W11 system-tray production work should use a tray-capable desktop shell later. The current source tree does not yet ship a Windows tray process.

## iOS

### Beta executable or installer

iOS distribution should use TestFlight when a native target exists. GitHub can host source and release notes, but iOS install testing goes through Apple tooling.

This target is not shipped yet.

### Source build

The planned source path is SwiftUI plus WidgetKit. See `docs/apple-platform-plan.md`.

## Local Component Workbench

The browser preview is a development workbench, not the product surface:

```sh
npm run serve
```

Open `http://127.0.0.1:4173`.

Use it to inspect the Linux, macOS, Windows, and iOS component previews while the native wrappers are being developed.

## Feedback From Your Machines

For each machine, record:

- OS and version
- bar or shell used, for example Waybar, GNOME extension, macOS menu bar, or W11 tray
- install path used: GitHub Release artifact or source
- screenshot of the tray/bar state
- profile values used, excluding any personal data you do not want public
- terminal output from the smoke test if the widget does not render

Do not file medical or personal health details as issues. The model is approximate and reflective only.
