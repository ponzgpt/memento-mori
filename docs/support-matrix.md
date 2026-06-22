# Support Matrix

This matrix describes what is actually release-ready in the repository.

| Platform | Status | User-facing surface | Source install | Release artifact |
| --- | --- | --- | --- | --- |
| Linux | Ready | Waybar-compatible custom JSON module | `./install.sh` | `memento-mori-linux-waybar-1.0.0.tar.gz` |
| macOS | source-installable | user-local app bundle backed by the local component app | `sh installers/macos/install.sh` | `memento-mori-local-app-1.0.0.tar.gz` |
| Windows 11 | source-installable | Start Menu launcher backed by the local component app | `powershell -ExecutionPolicy Bypass -File installers\windows\install.ps1` | `memento-mori-local-app-1.0.0.tar.gz` |
| iOS | Documented | SwiftUI and WidgetKit direction | not available | not available |

Signed macOS and Windows installers are a packaging layer over the same source. They require code-signing and distribution credentials before they can honestly be called signed production artifacts. The source paths above are the current release gate.

Every release must pass:

```sh
npm run verify
```

The canonical gate runs:

```sh
npm run audit
npm run lint
npm test
npm run check:release
npm run check:version
npm run check:web
npm run package
shasum -a 256 -c dist/SHA256SUMS
```
