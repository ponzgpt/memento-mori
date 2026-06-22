# Project Notes

## Container Workflow

- This project is dependency-free for the local component app and can run directly from `app/index.html` or via a local static server.
- Docker is optional. If Docker is available, preview with:

```sh
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```

- Do not install system packages on the host. Use the static app and local Node/Python already available, or the container recipe above.

## Checks

```sh
npm run audit
npm run lint
npm test
python3 -m py_compile waybar/memento.py
```
