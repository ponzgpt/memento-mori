# Memento Mori Widget

Memento Mori is a v1.8 MVP/mockup for a system-tray/status-bar countdown widget. It shows an approximate countdown to a deterministic life-expectancy date, with Linux, macOS, Windows, iOS, and Apple widget previews, a live settings panel, reflection prompts, and two classical palettes.

This is not medical, legal, actuarial, insurance, or mental-health advice. It is a reflective UI prototype.

## Philosophy

Memento Mori puts a finite clock next to the system clock. The goal is not gloom; it is attention. The widget should feel useful, quiet, and slightly rude in the way a correct calendar reminder is rude.

The design language uses classical memento mori motifs without turning the app into a costume party: bone, ash, onyx, candlelight, hourglass geometry, and restrained sarcasm. See [docs/philosophy.md](docs/philosophy.md).

## Production Beta

The current production-testable surface is the Linux status/tray module for bars that support custom JSON modules, with Waybar as the reference implementation. macOS, Windows, and iOS are documented as beta targets, but native installers are not shipped yet.

Use [docs/install.md](docs/install.md) as the canonical GitHub install guide. It documents both tracks for every OS:

- beta executable/installer track: free GitHub Release artifacts during beta, later sold as convenience installers through Stripe
- source track: Apache-2.0 source code that technical users can inspect, build, fork, and run themselves

For your own machines today, start with the Linux source install:

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
./install.sh
```

## Component Workbench

```sh
npm run serve
```

Then open `http://127.0.0.1:4173`.

The local browser view is a live component workbench for co-development. It is not the intended product surface. The shipping surfaces are status-bar modules, desktop app shells, and mobile/widgets.

The workbench has no package dependencies. It can also be opened directly from `app/index.html`, but the static server is the most reliable way to load ES modules in browsers.

Stack rationale is tracked in [docs/stack-decisions.md](docs/stack-decisions.md).

## Linux Status/Tray MVP

One-command install from a checked-out repository:

```sh
./install.sh
```

Create a config:

```sh
mkdir -p ~/.config/memento-mori
python3 waybar/memento.py --sample-config > ~/.config/memento-mori/config.json
```

Install the emitter:

```sh
mkdir -p ~/.local/bin
cp waybar/memento.py ~/.local/bin/memento-mori-waybar
chmod +x ~/.local/bin/memento-mori-waybar
```

Add the module from `waybar/config.example.jsonc` to `~/.config/waybar/config.jsonc`, then copy the relevant styles from `waybar/style.example.css` into `~/.config/waybar/style.css`.

For full per-OS instructions, see [docs/install.md](docs/install.md).

## Calculation

The live model uses:

```text
birth date + birthplace/current-residence 2024 World Bank life expectancy at birth + selected local offsets
```

If birthplace and current residence differ, the MVP applies a simple exposure blend after the entered move age. This is meant to represent migration context without pretending to model city-level effects such as Glasgow vs Madrid.

The live settings panel adds simple fixed offsets for six broad checkbox rows:

- sex
- sleep
- exercise
- drinking
- smoking
- health context

These offsets are intentionally coarse and local-only. They are not clinical estimates.

## Skins

Built-in palettes:

- bone and ash, represented in the UI by a minimal skull icon and an ashy grey accent
- onyx, represented in the UI by a minimal half-burnt candle icon with gold contrast

Technical users can define custom skins by targeting Waybar CSS classes such as `#custom-memento-mori.skin-system-light` or by overriding the web CSS variables in `app/styles.css`.

## Apple Platform

iOS and Apple widget support are part of the planned native roadmap. The near-term approach is SwiftUI plus WidgetKit for iOS widgets, Apple silicon Mac availability where practical, and a dedicated macOS menu-bar shell later if needed. See [docs/apple-platform-plan.md](docs/apple-platform-plan.md).

## Development Checks

```sh
npm run audit
npm run lint
npm test
python3 -m py_compile waybar/memento.py
```

Docker is optional and was not available on the development machine. If available:

```sh
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```

## License

Apache-2.0.

## Commercial Model

The intended commercial approach is free source on GitHub plus cheap paid installers for convenience. During beta, installer artifacts are planned to be free on GitHub Releases so they can be tested on real machines. Later, non-technical users pay through Stripe for signed builds and setup polish. The software is provided as-is, community PRs are welcome, and anyone can fork it. See [docs/commercial-model.md](docs/commercial-model.md).
