# Stack Decisions

Decision updated: 2026-08-01. Superseded 2026-09-09: the native widget (macOS/Windows menu bar, Linux Waybar) is the primary product; this document's "web product" scope is now specifically the demo and download page, not the whole of Memento Mori. See [product-requirements.md](product-requirements.md).

## Web demo stack

- Static semantic HTML defines one complete user journey, in English by default with a Spanish toggle (`app/i18n.js`, no library).
- CSS provides the editorial visual system, responsive layout, focus states, and reduced-motion behavior.
- Dependency-free JavaScript owns validation, deterministic calculation, local persistence, the life grid, the daily intention, reset, and copy behavior.
- A shared calculation module (`app/memento-core.js`) carries the same population baselines and lifestyle-factor values as the native widget, kept numerically in sync by hand and pinned by `tests/memento-core.test.mjs` -- they cannot literally share code across JavaScript and Swift.
- nginx serves the production files in a small Docker image, with `nginx.conf` forcing `Cache-Control: no-store` so a release is never invisible behind a stale browser cache.
- Traefik on the existing VPS terminates TLS and routes the stable domain.

## Decision criteria

### User value

The web demo needs birth-date, country, and lifestyle-factor inputs, one calculation, a visualization, and device-local state -- the same inputs the widget asks for. None of those jobs requires a framework, backend, or account.

### Cost

The existing Hostinger VPS, Dokploy network, domain, and certificate automation are reused. There is no additional hosting subscription and no metered application API.

### Operational simplicity

The production artifact contains only static files. There are no database migrations, external secrets, background jobs, or third-party JavaScript services. A release is one immutable Docker image and a service update; rollback is a previous image tag.

### Course fit

The implementation evidences requirements, routes/sections, reusable modules, Git, DRY calculation logic, tests, production build, Docker, VPS deployment, domain routing, TLS, and verification. Backend, MongoDB, JWT, Stripe, and authentication were studied but consciously excluded because they do not solve this product's problem.

## Rejected weight

- React/Next.js: unnecessary state and component complexity for the current flow.
- Backend/API: no server-side job and would create personal-data custody.
- Database/authentication: local persistence is sufficient and lower friction.
- Stripe: no paid transaction is part of the final-project value proposition.
- Analytics: unnecessary for the evaluation build and inconsistent with the stated privacy boundary.
- Countdown-to-the-second UI: visually precise but epistemically misleading.

## The native widget is the product, not a companion

Waybar, macOS, and Windows are not experiments retained alongside the web app -- they are Memento Mori. The web app's acceptance criteria in `product-requirements.md` cover the demo and download page specifically; the widget has its own design rules in `docs/apple-platform-plan.md`, `docs/native-packaging.md`, and `docs/philosophy.md`.
