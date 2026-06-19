#!/usr/bin/env sh
set -eu

APP_NAME="memento-mori"
BIN_DIR="${HOME}/.local/bin"
CONFIG_DIR="${HOME}/.config/${APP_NAME}"
BIN_PATH="${BIN_DIR}/memento-mori-waybar"
CONFIG_PATH="${CONFIG_DIR}/config.json"

mkdir -p "${BIN_DIR}" "${CONFIG_DIR}"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "${SCRIPT_DIR}/waybar/memento.py" "${BIN_PATH}"
chmod +x "${BIN_PATH}"

if [ ! -f "${CONFIG_PATH}" ]; then
  python3 "${BIN_PATH}" --sample-config > "${CONFIG_PATH}"
fi

cat <<EOF
Memento Mori installed.

Waybar executable:
  ${BIN_PATH}

Profile config:
  ${CONFIG_PATH}

Add this to Waybar:
  "custom/memento-mori": {
    "exec": "python3 ${BIN_PATH} --config ${CONFIG_PATH}",
    "interval": 1,
    "return-type": "json",
    "format": "MM {}",
    "tooltip": true
  }
EOF
