# Stack Decisions

Decision updated: 2026-08-01.

## Primary web product

- Static semantic HTML defines one complete Spanish user journey.
- CSS provides the editorial visual system, responsive layout, focus states, and reduced-motion behavior.
- Dependency-free JavaScript owns validation, deterministic calculation, local persistence, the life grid, the daily intention, reset, and copy behavior.
- A shared calculation module remains importable by tests and retained native experiments.
- nginx serves the production files in a small Docker image.
- Traefik on the existing VPS terminates TLS and routes the stable domain.

## Decision criteria

### User value

The product needs two inputs, one calculation, a visualization, and device-local state. None of those jobs requires a framework, backend, or account.

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

## Retained companions

Waybar, macOS, and Windows experiments remain in the repository as secondary explorations. They do not define the final web product, its acceptance criteria, or its deployment.
