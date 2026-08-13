#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_NAME="${1:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
BUILD_ROOT="$ROOT_DIR/.release"
RELEASE_DIR="$BUILD_ROOT/$RELEASE_NAME"
ARCHIVE_PATH="$BUILD_ROOT/${RELEASE_NAME}.tar.gz"

rm -rf "$RELEASE_DIR"
rm -f "$ARCHIVE_PATH"
mkdir -p "$RELEASE_DIR/frontend/.next" "$RELEASE_DIR/admin_panel/.next" "$RELEASE_DIR/backend"

require_path() {
  local target="$1"
  if [[ ! -e "$target" ]]; then
    echo "Missing build artifact: $target" >&2
    exit 1
  fi
}

require_path "$ROOT_DIR/frontend/.next/standalone"
require_path "$ROOT_DIR/frontend/.next/static"
require_path "$ROOT_DIR/admin_panel/.next/standalone"
require_path "$ROOT_DIR/admin_panel/.next/static"
require_path "$ROOT_DIR/backend/dist"
require_path "$ROOT_DIR/backend/node_modules"

copy_next_standalone() {
  local app_name="$1"
  local standalone_dir="$ROOT_DIR/$app_name/.next/standalone"
  local destination="$RELEASE_DIR/$app_name"
  local server_path

  # Keep the standalone dependency tree at the release root. In a workspace,
  # Next.js places the actual app below <workspace>/<app>/server.js.
  cp -R "$standalone_dir/." "$destination/"

  if [[ ! -f "$destination/server.js" ]]; then
    server_path="$(find "$standalone_dir" -path "*/$app_name/server.js" -print -quit)"
    if [[ -z "$server_path" ]]; then
      echo "Missing standalone server.js for $app_name" >&2
      exit 1
    fi
    cp -R "$(dirname "$server_path")/." "$destination/"
  fi

  require_path "$destination/server.js"
  cp -R "$ROOT_DIR/$app_name/public" "$destination/public"
  mkdir -p "$destination/.next"
  cp -R "$ROOT_DIR/$app_name/.next/static" "$destination/.next/static"
}

copy_next_standalone "frontend"
copy_next_standalone "admin_panel"

# Backend runtime bundle
cp -R "$ROOT_DIR/backend/dist" "$RELEASE_DIR/backend/dist"
cp -R "$ROOT_DIR/backend/node_modules" "$RELEASE_DIR/backend/node_modules"
cp "$ROOT_DIR/backend/package.json" "$RELEASE_DIR/backend/package.json"

# Deploy scripts and metadata
cp -R "$ROOT_DIR/deploy" "$RELEASE_DIR/deploy"
git -C "$ROOT_DIR" rev-parse HEAD > "$RELEASE_DIR/REVISION"

mkdir -p "$BUILD_ROOT"
tar -C "$BUILD_ROOT" -czf "$ARCHIVE_PATH" "$RELEASE_NAME"
printf '%s\n' "$ARCHIVE_PATH"
