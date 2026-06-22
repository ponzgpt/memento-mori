#!/usr/bin/env sh
set -eu

APP_NAME="Memento Mori Widget"
APP_SUPPORT="${HOME}/Library/Application Support/Memento Mori"
APP_BUNDLE="${HOME}/Applications/${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "${SCRIPT_DIR}/../.." && pwd)

command -v node >/dev/null 2>&1 || {
  printf '%s\n' "Node.js is required for the source install." >&2
  exit 1
}

mkdir -p "${APP_SUPPORT}" "${MACOS}" "${CONTENTS}/Resources" "${HOME}/Applications"
rm -rf "${APP_SUPPORT}/app" "${APP_SUPPORT}/scripts" "${APP_SUPPORT}/docs"

cp -R "${ROOT_DIR}/app" "${APP_SUPPORT}/app"
cp -R "${ROOT_DIR}/scripts" "${APP_SUPPORT}/scripts"
cp -R "${ROOT_DIR}/docs" "${APP_SUPPORT}/docs"
cp "${ROOT_DIR}/README.md" "${APP_SUPPORT}/README.md"
cp "${ROOT_DIR}/LICENSE" "${APP_SUPPORT}/LICENSE"
cp "${ROOT_DIR}/package.json" "${APP_SUPPORT}/package.json"

cat > "${CONTENTS}/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>memento-mori</string>
  <key>CFBundleIdentifier</key>
  <string>com.ponzgpt.mementomori</string>
  <key>CFBundleName</key>
  <string>Memento Mori Widget</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
</dict>
</plist>
PLIST

cat > "${MACOS}/memento-mori" <<'APP'
#!/usr/bin/env sh
set -eu

APP_SUPPORT="${HOME}/Library/Application Support/Memento Mori"
PORT="${PORT:-4173}"

cd "${APP_SUPPORT}"
node scripts/serve.mjs "${PORT}" &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

sleep 1
open "http://127.0.0.1:${PORT}/"
wait "${SERVER_PID}"
APP

chmod +x "${MACOS}/memento-mori"

cat <<EOF
Memento Mori installed for macOS.

Application:
  ${APP_BUNDLE}

Open it from Finder or run:
  open "${APP_BUNDLE}"
EOF
