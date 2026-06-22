# Memento Mori Widget

Memento Mori is a local status-bar widget that places an approximate life countdown next to the system clock. It uses a birth date, country context, and a few coarse lifestyle rows to render years, days, hours, minutes, and seconds remaining. Linux users can install the Waybar module from source with `./install.sh`; macOS and Windows users can run the desktop component app from source; paid convenience installers are distributed through release artifacts when available.

This is a reflective interface, not a prophecy. It is not medical, legal, actuarial, insurance, or mental-health advice.

## Install

Source install for Linux bars that support custom JSON modules:

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
./install.sh
```

Run the local desktop component app on Linux, macOS, or Windows:

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
npm run serve
```

Open `http://127.0.0.1:4173`.

Release artifacts, when published, are available from GitHub Releases. The source remains Apache-2.0; paid installers are convenience packaging for users who prefer a signed executable and a quieter setup path. Full platform notes are in [docs/install.md](docs/install.md).

## What It Does

- Shows a compact `MM` countdown in a tray/status-bar shape.
- Includes seconds by default.
- Integrates progress inside the widget.
- Provides a single live settings panel: birth date, birth country, living country, since age, sex, sleep, exercise, drinking, smoking, and health context.
- Supports two built-in palettes: bone and ash, and onyx.
- Emits Waybar-compatible JSON for Linux.
- Keeps all profile data local.
- Occasionally shows a dry reflection prompt. No title, no lecture, just the little tap on the glass.

## Platform Surfaces

| Platform | Primary path | Source path |
| --- | --- | --- |
| Linux | Waybar-compatible custom JSON module | `./install.sh` |
| macOS | Menu-bar/widget packaging from release artifacts | `npm run serve` for the desktop component app |
| Windows 11 | Tray-app packaging from release artifacts | `npm run serve` for the desktop component app |
| iOS | WidgetKit app distribution through Apple tooling | SwiftUI/WidgetKit plan in [docs/apple-platform-plan.md](docs/apple-platform-plan.md) |

Linux is the reference implementation because the Unix bar module is the smallest useful version of the idea. Native desktop and Apple surfaces should keep the same model, palette, and copy rules rather than growing a dashboard nobody asked for.

## Waybar Module

Create or inspect a profile:

```sh
mkdir -p ~/.config/memento-mori
python3 ~/.local/bin/memento-mori-waybar --sample-config > ~/.config/memento-mori/config.json
```

Add the module to Waybar:

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

The command emits one JSON object with `text`, `tooltip`, `class`, and `percentage`.

## Calculation

The model is deterministic and deliberately modest:

```text
birth date + birth/current country life expectancy + coarse local offsets
```

Country values use World Bank WDI life expectancy at birth data. If birth country and current country differ, the model blends toward the current residence after the entered move age. The lifestyle rows are local offsets, not a clinical risk model. Details are in [docs/model.md](docs/model.md).

## Design

The widget borrows from memento mori and vanitas imagery: hourglass, bone, ash, onyx, candlelight, and the occasional skull where it belongs. The point is attention, not horror. The tray stays quiet; the panel carries the art.

Typography direction:

- Fraunces for clock and brand moments.
- Geist for interface text.
- System fallbacks always remain in place.

The philosophy and tone rules are in [docs/philosophy.md](docs/philosophy.md).

## Repository

- [docs/install.md](docs/install.md): install and packaging paths.
- [docs/model.md](docs/model.md): calculation model and source boundaries.
- [docs/philosophy.md](docs/philosophy.md): product concept, tone, and visual rules.
- [docs/commercial-model.md](docs/commercial-model.md): open source plus paid installer posture.
- [docs/stack-decisions.md](docs/stack-decisions.md): technical choices and rejected weight.
- [docs/apple-platform-plan.md](docs/apple-platform-plan.md): macOS/iOS direction.
- [docs/release.md](docs/release.md): release checklist and artifact rules.
- [docs/feature-status.csv](docs/feature-status.csv): canonical feature and user-story status sheet.

## Quality Gates

```sh
npm run audit
npm run lint
npm test
npm run package
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

Optional container preview:

```sh
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```

## License

Apache-2.0. The software is provided as-is. Community pull requests are welcome when they improve the product without turning a small status-bar widget into a lifestyle platform. Forks are allowed; mortality, unfortunately, remains upstream.
