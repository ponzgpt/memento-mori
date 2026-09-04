# AGENTS.md — memento-mori

> **Qué es:** Memento Mori — app web (ES) de perspectiva de esperanza de vida, con compañero nativo de macOS y módulo Waybar.
> **Estado:** activo (v2.0.0, en producción) · **Tipo:** proyecto personal / capstone Racks Academy
> **Dueño:** Javier Ponz · **Remoto:** https://github.com/ponzgpt/memento-mori · **Live:** https://memento.technoir.cloud/

## Stack
- **Lenguaje:** JavaScript (ESM, sin dependencias) + Python (tests, Waybar) + Swift (compañero nativo de macOS)
- **Frontend:** HTML/CSS/JS estático — `app/index.html` es el punto de entrada, sin build step
- **Waybar:** `waybar/memento.py` genera el payload JSON para la barra de estado (Linux, secundario)
- **Deploy:** Docker + nginx + Traefik en VPS existente (ver `docs/deployment.md`)
- Do not install system packages on the host. Use the static app and local Node/Python already available, or the container recipe below.

## Dev environment
```bash
# Servidor local (sin instalar nada)
npm run serve        # http://localhost:4173

# Docker (opcional, preview aislado)
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```
- **Regla:** no instalar paquetes de sistema en el host. Usar Node/Python del sistema o el contenedor.

## Checks

Use the canonical gate before handing off code:

```sh
npm run verify
```

GitHub Actions runs the gate on Linux, macOS, and Windows.

For narrower loops, the gate is composed from:

```sh
npm run audit
npm run check:installers
npm run check:production
npm run check:release
npm run check:version
npm run check:web
npm run lint
npm test
npm run release:notes
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

Todo en verde antes de cualquier commit. Keep the product local, compact, and honest about platform readiness. Do not present macOS or Windows source installers as signed installers until signing and installer QA exist.

## Convenciones
- Sin dependencias externas en el core web (zero-dep); el compañero nativo macOS es un módulo aparte.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Mensajes de commit en inglés.

## Notas para el agente (Syl)
- `config/profile.example.json` es el ejemplo de configuración de usuario; nunca commitear el `.json` real con datos personales.
- El sitio `javier-ponz-site` (portfolio de ponzgpt) puede enlazar a la app en vivo (`memento.technoir.cloud`) en vez de embeber el widget.
- No hay modelo comercial activo: ver `docs/commercial-model.md` (roadmap honesto, sin pagos hoy).
