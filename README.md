# Memento Mori

Memento Mori is a small, honest countdown: a population life-expectancy reference turned into a calm picture of finite time. The native menu-bar/Waybar widget is the product -- it lives in the OS you already look at. This repository's web app is its bilingual (English default, Spanish toggle) online demo and download page, running the exact same model.

Public demo: <https://memento.technoir.cloud/>

This is a reflective aid, not an individual death prediction. It is not medical, legal, actuarial, insurance, or mental-health advice.

## The concrete problem

People know that time is finite, but the idea stays abstract. Abstract limits are easy to postpone around: the loud task wins, the meaningful conversation moves to next month, and an ordinary day feels interchangeable with any other.

The product makes that limit understandable without claiming certainty. Enter a birth date, a country of birth (and, if it differs, a country of residence and the age you moved), and six lifestyle factors; get a central population horizon with a broad uncertainty range, the result at human scale, and one concrete intention for today. Installed as the widget, that same estimate sits in the menu bar and keeps counting; the web app is the same calculation, tried in a browser first.

## Primary flow

1. Enter a birth date, country context, and the six lifestyle factors.
2. Receive a central horizon plus an explicit seven-year margin on each side.
3. See approximate remaining years, weeks, days, and a 100-year life grid.
4. Translate the perspective into one intention for today.
5. Return on the same device and recover the profile and intention locally, or install the widget so the estimate lives outside the browser.

## Product boundaries

- No account, backend, database, analytics, advertising, or cloud profile.
- No claim that the displayed date predicts an individual death.
- No gamification, streaks, fear language, or productivity guilt.
- The copied summary excludes the birth date.

These are deliberate product decisions. Additional technical layers would increase complexity without improving the core user job.

## Run locally

The web app has no runtime package dependencies.

```sh
npm run serve
```

Open <http://127.0.0.1:4173>.

Container preview:

```sh
docker build -t memento-mori-web:2.0.0 .
docker run --rm -p 8080:80 memento-mori-web:2.0.0
```

Open <http://127.0.0.1:8080>.

## Calculation

The model is deterministic and inspectable:

```text
birth date + 2024 country life-expectancy reference = central horizon
central horizon -/+ 7 years = perspective range
```

Country values are a fixed snapshot of World Bank WDI indicator `SP.DYN.LE00.IN`. A population-period statistic cannot know an individual future, so the product labels the result as approximate and keeps a wide range visible beside it. Details are in [docs/model.md](docs/model.md).

## Privacy

Calculation happens in the browser. The profile and daily intention use local storage on that device. If storage is unavailable, calculation still works and the interface reports that persistence is unavailable. [PRIVACY.md](PRIVACY.md) documents the data boundary and deletion paths.

## Deployment

The production build is the same static `app/` directory served by nginx in Docker. The existing Hostinger VPS and Dokploy network are reused; Traefik handles the stable domain and TLS. This keeps the runtime small, costs no additional subscription, and demonstrates the course's Docker/VPS/domain/SSL path. See [docs/deployment.md](docs/deployment.md) for the exact build, release, verification, rollback, and decision rationale.

## Quality gate

```sh
npm run verify
```

The gate checks calculation edge cases, feature stories, accessibility-related markup, web assets, documentation, native companion scripts, release metadata, deterministic packaging, Python syntax, Waybar output, and `git diff --check`.

Focused commands:

```sh
npm test
npm run lint
npm run check:web
```

## Repository map

- `native/`, `waybar/`, and `installers/`: the native menu-bar (macOS/Windows) and Waybar (Linux) widget -- this is the primary product.
- `app/`: the web app -- an online demo of the same model, and the download page for the widget.
- `docs/product-requirements.md`: user problem, scope, requirements, and acceptance criteria for the web app.
- `docs/model.md` and `docs/model-data.md`: the shared model both surfaces run -- source, formula, exact values, uncertainty, and limitations.
- `docs/deployment.md`: production deployment and rollback runbook for the web app.
- `docs/feature-status.csv`: feature stories and retest state.
- `tests/`: calculation and product acceptance tests.
- `Dockerfile`, `nginx.conf`, and `compose.yaml`: reproducible static runtime for the web app.

## Why the stack is intentionally small

Plain HTML, CSS, and JavaScript are enough for this interaction. Docker makes the runtime reproducible. nginx serves immutable static files efficiently. The VPS, Traefik, and TLS path already exist. A framework, API, database, authentication service, or payment flow would add failure modes and personal-data handling without solving the stated problem.

## License

Apache-2.0. The software is provided as-is.
