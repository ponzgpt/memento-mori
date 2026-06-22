#!/usr/bin/env sh
set -eu

APP_BUNDLE="${HOME}/Applications/Memento Mori Widget.app"
APP_SUPPORT="${HOME}/Library/Application Support/Memento Mori"

rm -rf "${APP_BUNDLE}" "${APP_SUPPORT}"

printf '%s\n' "Memento Mori removed from macOS user paths."
