# memento-mori
Life-expectancy perspective web app (Spanish UI) with a native macOS companion and a Waybar module. Live: https://memento.technoir.cloud

## Commands
- Check (before every commit and deploy): `npm run verify`
- Dev: `npm run serve`
- Deploy: `./scripts/deploy.sh` (see `docs/deployment.md`)

## Non-negotiables
1. The web core in `app/` stays zero-dependency with no build step.
2. Never commit a real profile JSON, only `config/profile.example.json`: the real one holds personal data.
3. Never call the macOS or Windows installers signed until signing and installer QA exist.
