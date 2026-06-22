# Release Checklist

Use this checklist before publishing a GitHub Release or paid convenience installer.

## Version

- Update `package.json`.
- Update asset cache query strings in `app/index.html` when web assets change.
- Run `npm run check:version` before tagging.
- Tag the release with SemVer, for example `v1.0.0`.

## Checks

```sh
npm run verify
```

This is the canonical release gate. It runs the individual checks below, creates release artifacts, and verifies checksums:

```sh
npm run audit
npm run lint
npm run check:installers
npm run check:release
npm run check:version
npm run check:web
npm test
npm run release:notes
npm run package
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

## Artifacts

- Linux: `memento-mori-linux-waybar-*.tar.gz`, AppImage, or native package.
- Local desktop app: `memento-mori-local-app-*.tar.gz`.
- macOS: signed and notarized `.dmg` or `.pkg`.
- Windows: signed `.exe` or `.msi`.
- iOS: TestFlight or App Store build through Apple tooling.
- Checksums: `SHA256SUMS`.
- Machine-readable artifact manifest: `release-manifest.json`.

## Readiness Gate

The current release gate is `source-installable`, tracked in `release-readiness.json` and [support-matrix.md](support-matrix.md).

Do not describe macOS or Windows artifacts as signed installers until signing, notarization, and installer QA are complete.

## Notes

- Include source archive links.
- Update `CHANGELOG.md`.
- Use `npm run release:notes` for GitHub Release notes.
- State supported platforms clearly.
- Preserve Apache-2.0 notices.
- Keep disclaimers intact.
- Do not promise support, medical accuracy, actuarial accuracy, insurance suitability, mental-health advice, or legal advice.
