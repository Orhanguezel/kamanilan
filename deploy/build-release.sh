#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Syncthing ile senkronlanan makinede .git bulunmaz (.stignore geregi);
# orada release adi zaman damgasindan uretilir.
if git -C "$ROOT_DIR" rev-parse --short HEAD >/dev/null 2>&1; then
  DEFAULT_RELEASE_NAME="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
else
  DEFAULT_RELEASE_NAME="sync-$(date +%Y%m%d-%H%M%S)"
fi
RELEASE_NAME="${1:-$DEFAULT_RELEASE_NAME}"
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
mkdir -p "$RELEASE_DIR/backend/dist/db/seed/sql"
cp -R "$ROOT_DIR/backend/src/db/seed/sql/." "$RELEASE_DIR/backend/dist/db/seed/sql/"
cp -R "$ROOT_DIR/backend/node_modules" "$RELEASE_DIR/backend/node_modules"
cp "$ROOT_DIR/backend/package.json" "$RELEASE_DIR/backend/package.json"
cp "$ROOT_DIR/backend/bun.lock" "$RELEASE_DIR/backend/bun.lock"

# Bun hoists some workspace dependencies to the workspace node_modules. Copy the
# production packages that are not present in the project-local runtime tree.
WORKSPACE_NODE_MODULES="$(cd "$ROOT_DIR/.." && pwd)/node_modules"
for package_name in \
  fast-xml-parser strnum xlsx adler-32 cfb codepage crc-32 ssf wmf word frac \
  sanitize-html htmlparser2 parse-srcset postcss domelementtype domhandler domutils \
  entities nanoid picocolors source-map-js toad-cache sharp node-cron deepmerge \
  escape-string-regexp is-plain-object launder dayjs; do
  if [[ ! -e "$RELEASE_DIR/backend/node_modules/$package_name" ]] && \
     [[ -e "$WORKSPACE_NODE_MODULES/$package_name" ]]; then
    cp -R "$WORKSPACE_NODE_MODULES/$package_name" "$RELEASE_DIR/backend/node_modules/$package_name"
  fi
done

if [[ -d "$WORKSPACE_NODE_MODULES/@img" ]]; then
  mkdir -p "$RELEASE_DIR/backend/node_modules/@img"
  cp -R "$WORKSPACE_NODE_MODULES/@img/." "$RELEASE_DIR/backend/node_modules/@img/"
fi

mkdir -p "$RELEASE_DIR/backend/content-images/gelen" "$RELEASE_DIR/backend/content-images/islendi"

if [[ ! -e "$RELEASE_DIR/backend/node_modules/@fastify/rate-limit" ]]; then
  mkdir -p "$RELEASE_DIR/backend/node_modules/@fastify"
  cp -R "$WORKSPACE_NODE_MODULES/@fastify/rate-limit" \
    "$RELEASE_DIR/backend/node_modules/@fastify/rate-limit"
fi

# Deploy scripts and metadata
cp -R "$ROOT_DIR/deploy" "$RELEASE_DIR/deploy"
git -C "$ROOT_DIR" rev-parse HEAD > "$RELEASE_DIR/REVISION" 2>/dev/null || echo "$RELEASE_NAME" > "$RELEASE_DIR/REVISION"

mkdir -p "$BUILD_ROOT"
tar -C "$BUILD_ROOT" -czf "$ARCHIVE_PATH" "$RELEASE_NAME"
printf '%s\n' "$ARCHIVE_PATH"
