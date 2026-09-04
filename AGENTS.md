# AGENTS.md — memento-mori

> **Qué es:** Widget de cuenta regresiva Memento Mori (esperanza de vida) para Waybar/web.
> **Estado:** activo (MVP)  ·  **Tipo:** proyecto personal / exploración
> **Dueño:** Javier Ponz · **Remoto:** https://github.com/ponzgpt/memento-mori

## Stack
- **Lenguaje:** JavaScript (ESM, sin dependencias) + Python (tests)
- **Frontend:** HTML/CSS/JS estático — `app/index.html` es el punto de entrada
- **Waybar:** `waybar/memento.py` genera el payload JSON para la barra de estado
- **Docker:** opcional para preview contenedorizado

## Dev environment
```bash
# Servidor local (sin instalar nada)
npm run serve        # http://localhost:4173

# Docker (opcional)
docker build -t memento-mori-widget .
docker run --rm -p 8080:80 memento-mori-widget
```
- **Regla:** no instalar paquetes de sistema en el host. Usar Node/Python del sistema o el contenedor.

## Tests — correr SIEMPRE antes de hacer commit
```bash
npm run audit        # comprueba estructura del proyecto
npm run lint         # lint JS
npm test             # tests JS + Python
python3 -m py_compile waybar/memento.py   # compila el script waybar
```
- Todo en verde antes de cualquier commit.

## Convenciones
- Sin dependencias externas en el MVP (zero-dep).
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Mensajes de commit en inglés.

## Notas para el agente (Syl)
- El único historial de commit hasta ahora es `549fa0e` — repo joven.
- `config/profile.example.json` es el ejemplo de configuración de usuario; nunca commitear el `.json` real con datos personales.
- `personal-site` repo (ponzgpt) es candidato a mostrar este widget embebido en el portfolio.
