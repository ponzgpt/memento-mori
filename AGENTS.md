# Project Notes

## Container Workflow

- This project is dependency-free for the local component app and can run directly from `app/index.html` or via a local static server.
- Do not install system packages on the host. Use the static app and local Node/Python already available, or the container recipe below.
- Docker is optional for previewing the static app in an isolated runtime:

```sh
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```

## Checks

Use the canonical gate before handing off code:

```sh
npm run verify
```

For narrower loops, the gate is composed from:

```sh
npm run audit
npm run check:installers
npm run check:release
npm run check:version
npm run check:web
npm run lint
npm test
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

Keep the product local, compact, and honest about platform readiness. Do not present macOS or Windows source installers as signed installers until signing and installer QA exist.
