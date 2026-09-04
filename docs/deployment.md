# Production Deployment Runbook

Canonical URL: <https://memento.technoir.cloud/>

Deployment target: existing Hostinger VPS, Docker Swarm service `memento-mori-racks`, shared `dokploy-network`, and Traefik-managed HTTPS.

## Why this deployment was chosen

### Cost

The VPS and domain already exist, so this path adds no new subscription. A free static host would also work, but it would introduce another vendor and account without reducing the current cost.

### Course alignment

Racks introduces simple static deployment early and later teaches production build, Docker, VPS, domain assignment, SSL, API SSL, and verification. This project uses the final Docker/VPS/domain/SSL path while keeping the application itself proportionate to its problem.

### Reliability and rollback

nginx serves only static files. Each release receives an immutable image tag. Docker Swarm keeps one replica running and can roll back to the preceding service specification. Traefik owns routing and certificate renewal separately from the app container.

### Privacy

The server receives ordinary HTTP request metadata for static assets but not the birth date, country selection, or intention. Those values never leave the browser.

## Architecture

```text
Visitor browser
  -> HTTPS memento.technoir.cloud
  -> Traefik on the VPS (TLS and hostname routing)
  -> Docker Swarm service on dokploy-network
  -> nginx container
  -> static files from app/

Profile and intention stay in browser local storage.
```

## Prerequisites

- Local release passes `npm run verify`.
- Dockerfile builds from the repository root.
- SSH access uses the existing authenticated host alias; no secret is written to the repository.
- DNS for `memento.technoir.cloud` already points at the VPS.
- The external Docker network `dokploy-network` and Traefik are healthy.

## Step 1 — Verify the source

From the repository root:

```sh
npm run verify
git diff --check
```

This catches invalid dates and range math, stale feature requirements, missing assets, web-server smoke failures, native companion regressions, packaging drift, and whitespace errors before production is touched.

## Step 2 — Build an immutable image

Choose a unique release tag, for example:

```sh
docker build -t memento-mori-racks:2.0.0-racks.2 .
```

The Dockerfile starts from `nginx:1.27-alpine` and copies `app/` to `/usr/share/nginx/html/`. No build secret or runtime environment variable is required.

## Step 3 — Test the image before updating production

```sh
docker run --rm -d --name memento-mori-release-check -p 127.0.0.1:18080:80 memento-mori-racks:2.0.0-racks.2
curl --fail http://127.0.0.1:18080/
curl --fail http://127.0.0.1:18080/main.js
docker stop memento-mori-release-check
```

The test binds only to loopback, proves nginx starts, and proves the main document and JavaScript are inside the image.

## Step 4 — Record the rollback target

Before the service update, inspect the current image and service state:

```sh
docker service inspect memento-mori-racks --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'
docker service ps memento-mori-racks
```

Copy the current image tag into the private operator log. Do not rely on `latest`; a named tag makes rollback deterministic.

## Step 5 — Make the image available on the VPS

The deployment uses a direct, authenticated SSH path and builds from the checked source bundle on the server. The source directory is `/opt/memento-mori-racks`. Transfer only repository files required for the Docker build and never transfer `.git`, local storage, credentials, or course transcripts.

On the VPS:

```sh
cd /opt/memento-mori-racks
docker build -t memento-mori-racks:2.0.0-racks.2 .
```

Building on the target avoids a registry dependency and architecture mismatch for this single-node service.

## Step 6 — Update the Swarm service

```sh
docker service update \
  --image memento-mori-racks:2.0.0-racks.2 \
  --update-order start-first \
  --update-parallelism 1 \
  --update-delay 5s \
  memento-mori-racks
```

`start-first` reduces visible interruption: the replacement task starts before the old task stops. One replica and one-at-a-time updates match the scale of the product.

## Step 7 — Verify container and route

```sh
docker service ls --filter name=memento-mori-racks
docker service ps memento-mori-racks --no-trunc
curl --fail --silent --show-error https://memento.technoir.cloud/ >/dev/null
curl --fail --silent --show-error https://memento.technoir.cloud/main.js >/dev/null
curl --fail --silent --show-error https://memento.technoir.cloud/og.png >/dev/null
```

Then verify in a browser at desktop and mobile widths:

1. HTTPS loads without a certificate warning.
2. The page shows “Recuerda que vas a morir. Decide cómo vivir hoy.”
3. An invalid future date announces an inline error.
4. A valid profile produces date, range, units, grid, and intention section.
5. Reload restores the saved profile and intention.
6. Copy omits the birth date.
7. Reset removes both local records.

## Rollback

If the task fails to stabilize or functional verification fails:

```sh
docker service rollback memento-mori-racks
docker service ps memento-mori-racks --no-trunc
curl --fail https://memento.technoir.cloud/ >/dev/null
```

If Swarm rollback metadata is unavailable, update explicitly to the image tag recorded in Step 4. Do not delete the failed image until the cause is understood.

## TLS and routing

The Traefik dynamic configuration is kept outside the app source so certificate and routing operations remain independent of releases. It matches host `memento.technoir.cloud`, sends traffic to port 80 on the service, and uses the existing ACME certificate resolver. No TLS private key is copied into the repository or container.

## Alternative considered

Netlify or Vercel could host the static directory with a generous free tier and were reasonable course-aligned options. They were not selected because the existing VPS already provides Docker, domain routing, certificate automation, and an operational rollback path at no incremental cost. The static architecture keeps a future move to either provider straightforward.
