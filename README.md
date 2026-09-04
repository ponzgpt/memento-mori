# Memento Mori

Memento Mori is a Spanish-first web app that turns a population life-expectancy reference into a calm picture of finite time and one intentional action for today.

Public app: <https://memento.technoir.cloud/>

This is a reflective aid, not an individual death prediction. It is not medical, legal, actuarial, insurance, or mental-health advice.

## The concrete problem

People know that time is finite, but the idea stays abstract. Abstract limits are easy to postpone around: the loud task wins, the meaningful conversation moves to next month, and an ordinary day feels interchangeable with any other.

The app makes that limit understandable without claiming certainty. A visitor enters a birth date and a country reference, sees a central population horizon with a broad uncertainty range, views the result at human scale, and writes one concrete intention for today.

## Primary flow

1. Enter a birth date and country reference.
2. Receive a central horizon plus an explicit seven-year margin on each side.
3. See approximate remaining years, weeks, days, and a 100-year life grid.
4. Translate the perspective into one intention for today.
5. Return on the same device and recover the profile and intention locally.

## Product boundaries

- No account, backend, database, analytics, advertising, or cloud profile.
- No lifestyle or health scoring in the web flow.
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

- `app/`: production web app and social card.
- `docs/product-requirements.md`: user problem, scope, requirements, and acceptance criteria.
- `docs/model.md`: source, formula, uncertainty, and limitations.
- `docs/deployment.md`: production deployment and rollback runbook.
- `docs/feature-status.csv`: feature stories and retest state.
- `tests/`: calculation and product acceptance tests.
- `Dockerfile` and `compose.yaml`: reproducible static runtime.
- `waybar/`, `native/`, and `installers/`: retained experimental native companions; they are not the final-course product.

## Why the stack is intentionally small

Plain HTML, CSS, and JavaScript are enough for this interaction. Docker makes the runtime reproducible. nginx serves immutable static files efficiently. The VPS, Traefik, and TLS path already exist. A framework, API, database, authentication service, or payment flow would add failure modes and personal-data handling without solving the stated problem.

## License

Apache-2.0. The software is provided as-is.
