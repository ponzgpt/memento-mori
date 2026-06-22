# Release Checklist

Use this checklist before publishing a GitHub Release or paid convenience installer.

## Version

- Update `package.json`.
- Update asset cache query strings in `app/index.html` when web assets change.
- Tag the release with SemVer, for example `v1.0.0`.

## Checks

```sh
npm run audit
npm run lint
npm test
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

## Artifacts

- Linux: archive, AppImage, or native package.
- macOS: signed and notarized `.dmg` or `.pkg`.
- Windows: signed `.exe` or `.msi`.
- iOS: TestFlight or App Store build through Apple tooling.

## Notes

- Include source archive links.
- State supported platforms clearly.
- Preserve Apache-2.0 notices.
- Keep disclaimers intact.
- Do not promise support, medical accuracy, actuarial accuracy, insurance suitability, mental-health advice, or legal advice.
