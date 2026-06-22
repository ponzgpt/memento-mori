#!/usr/bin/env sh
set -eu

APP_NAME="Memento Mori Widget"
APP_SUPPORT="${HOME}/Library/Application Support/Memento Mori"
APP_BUNDLE="${HOME}/Applications/${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"
EXECUTABLE="${MACOS}/memento-mori-menubar"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "${SCRIPT_DIR}/../.." && pwd)

command -v swiftc >/dev/null 2>&1 || {
  printf '%s\n' "Swift compiler is required for the macOS menu-bar source install." >&2
  exit 1
}

APP_VERSION=$(awk -F'"' '/"version":/ { print $4; exit }' "${ROOT_DIR}/package.json")

mkdir -p "${APP_SUPPORT}" "${MACOS}" "${CONTENTS}/Resources" "${HOME}/Applications"
rm -rf "${APP_SUPPORT}/app" "${APP_SUPPORT}/scripts" "${APP_SUPPORT}/docs" "${APP_SUPPORT}/native"
rm -f "${MACOS}/memento-mori"

cp -R "${ROOT_DIR}/docs" "${APP_SUPPORT}/docs"
cp -R "${ROOT_DIR}/native" "${APP_SUPPORT}/native"
cp "${ROOT_DIR}/README.md" "${APP_SUPPORT}/README.md"
cp "${ROOT_DIR}/LICENSE" "${APP_SUPPORT}/LICENSE"
cp "${ROOT_DIR}/package.json" "${APP_SUPPORT}/package.json"

swiftc "${ROOT_DIR}/native/macos/MementoMoriMenuBar.swift" -o "${EXECUTABLE}"

cat > "${CONTENTS}/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>memento-mori-menubar</string>
  <key>CFBundleIdentifier</key>
  <string>com.ponzgpt.mementomori</string>
  <key>CFBundleName</key>
  <string>Memento Mori Widget</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${APP_VERSION}</string>
  <key>LSUIElement</key>
  <true/>
</dict>
</plist>
PLIST
chmod +x "${EXECUTABLE}"

cat <<EOF
Memento Mori installed for macOS.

Application:
  ${APP_BUNDLE}

Open it from Finder or run:
  open "${APP_BUNDLE}"
EOF
