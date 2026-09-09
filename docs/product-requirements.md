# Web Product Requirements

Decision date: 2026-08-01. Superseded 2026-09-09: the native menu-bar/Waybar widget is the primary product; this document now covers the web app's role as its online demo, not a competing product.

## Product job

Memento Mori turns an abstract fact -- life is finite -- into a private, understandable perspective that helps a person decide what deserves attention today.

The widget -- native menu bar on macOS and Windows, Waybar on Linux -- is the primary product: it lives in the OS the user already looks at, with no tab to keep open. The web app is its demo and download funnel: a visitor enters the same context the widget asks for, sees the exact same model compute their estimate, and can then install the widget to get the same result without the browser. It is not a lesser or parallel calculation -- see `docs/model-data.md` for the shared model both surfaces run.

## User problem

People know time is limited but experience that limit as an abstraction. The result is postponement, misplaced urgency, and difficulty distinguishing what matters from what merely feels loud.

## Primary flow

1. Enter birth date, country context, and the same six lifestyle factors the widget asks for.
2. Receive a clearly labelled population-based horizon and a broad uncertainty range.
3. See time lived and remaining as years, weeks, days, and a life grid.
4. Write one intention for today.
5. Return later on the same device and find the profile and intention preserved locally.
6. Optionally install the native widget so the same estimate lives in the OS instead of a browser tab.

## Functional requirements

- Spanish-first, responsive, keyboard-accessible single-page web app.
- Birth date validation: required, real calendar date, not in the future, plausible age.
- Birth country and, optionally, a different current country plus the age moved, selected from the documented World Bank WDI snapshot -- same fields, same blend formula as the widget.
- The same six lifestyle factors as the widget (sex, sleep, exercise, drinking, smoking, health), same values, same defaults -- see `docs/model-data.md`.
- Central horizon date plus an explicit `+/- 7 years` perspective range.
- A visible path to install the native widget for each supported platform.
- Remaining years, weeks, and days calculated from the same deterministic core.
- Life progress displayed numerically and as an accessible year grid.
- A daily intention can be saved, edited, completed, or cleared.
- Profile and intention stay in browser local storage; no account or analytics.
- Reset action removes local product data after confirmation.
- Explanation of method, data source, uncertainty, privacy, and safety limits in the product.
- Share/copy action produces a neutral text summary without including the birth date.

## Product and language boundaries

- Never claim to predict an individual death.
- Never describe the output as medical, actuarial, insurance, legal, or mental-health advice.
- Never imply that a countdown to the second is precise. Seconds may animate the interface, but the primary result is a broad horizon.
- Avoid fear, punishment, gamification, streaks, and productivity guilt.
- The tone is calm, direct, reflective, and useful.

## Technical constraints

- `app/memento-core.js` (web, JavaScript) and `native/macos/MementoMoriMenuBar.swift` (widget, Swift) cannot literally share code across languages, so they carry the population baselines and the six lifestyle-factor tables as two independent, hand-kept-identical copies. A change to one model's values is not done until the other is updated to match -- `tests/memento-core.test.mjs` pins the web side's numbers, so a silent drift fails the test suite rather than the user's trust.
- Keep the deployed app static and client-only because the required state is device-local.
- Preserve the existing Docker/nginx path and VPS reverse proxy so the public URL remains stable.
- Add no backend, database, authentication, payment, or third-party runtime dependency without a user need.

## Acceptance criteria

- A first-time visitor can produce a result in under one minute.
- The result gives both perspective and a concrete next action.
- The app is usable at narrow mobile and desktop widths.
- Invalid or future dates show an inline, announced error instead of a broken result.
- Reloading preserves a valid profile and the latest intention on the same device.
- With storage unavailable, the calculation still works and the UI explains that persistence is unavailable.
- The full release gate, web smoke test, and focused calculation tests pass.
- The deployed HTTPS URL serves the complete web experience and not the former widget gallery.
