# Web Product Requirements

Decision date: 2026-08-01.

## Product job

Memento Mori turns an abstract fact -- life is finite -- into a private, understandable perspective that helps a person decide what deserves attention today.

The web app is not a gallery of operating-system widgets. It is the primary product. A visitor should be able to enter two pieces of context, understand the estimate, see their time at human scale, and write one concrete intention without creating an account.

## User problem

People know time is limited but experience that limit as an abstraction. The result is postponement, misplaced urgency, and difficulty distinguishing what matters from what merely feels loud.

## Primary flow

1. Enter birth date and country context.
2. Receive a clearly labelled population-based horizon and a broad uncertainty range.
3. See time lived and remaining as years, weeks, days, and a life grid.
4. Write one intention for today.
5. Return later on the same device and find the profile and intention preserved locally.

## Functional requirements

- Spanish-first, responsive, keyboard-accessible single-page web app.
- Birth date validation: required, real calendar date, not in the future, plausible age.
- Country baseline selected from the documented World Bank WDI snapshot.
- Central horizon date plus an explicit `+/- 7 years` perspective range.
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

- Reuse the small calculation core where it remains honest; remove unsupported lifestyle offsets from the web flow.
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
