#!/usr/bin/env bash

set -euo pipefail

BASE_DIR="${1:?base dir required}"
ARCHIVE_PATH="${2:?archive path required}"
RELEASE_NAME="${3:?release name required}"

RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
TMP_DIR="$BASE_DIR/tmp"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_NAME"
CURRENT_LINK="$BASE_DIR/current"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

mkdir -p \
  "$RELEASES_DIR" \
  "$TMP_DIR" \
  "$SHARED_DIR/frontend" \
  "$SHARED_DIR/admin_panel" \
  "$SHARED_DIR/backend" \
  "$SHARED_DIR/uploads"

ensure_shared_file() {
  local target="$1"
  local legacy="$2"
  if [[ ! -f "$target" ]]; then
    if [[ -f "$legacy" ]]; then
      cp "$legacy" "$target"
    else
      echo "Missing shared env file: $target" >&2
      exit 1
    fi
  fi
}

ensure_shared_dir() {
  local target="$1"
  shift
  if [[ ! -d "$target" ]] || [[ -z "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
    for legacy in "$@"; do
      if [[ -d "$legacy" ]]; then
        mkdir -p "$target"
        cp -R "$legacy"/. "$target"/ 2>/dev/null || true
        return
      fi
    done
  fi
}

ensure_shared_file "$SHARED_DIR/frontend/.env" "$BASE_DIR/frontend/.env"
ensure_shared_file "$SHARED_DIR/admin_panel/.env" "$BASE_DIR/admin_panel/.env"
ensure_shared_file "$SHARED_DIR/backend/.env" "$BASE_DIR/backend/.env"
ensure_shared_dir "$SHARED_DIR/uploads" "$BASE_DIR/backend/uploads" "$BASE_DIR/uploads"

rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$RELEASES_DIR"

ln -sfn "$SHARED_DIR/frontend/.env" "$RELEASE_DIR/frontend/.env"
ln -sfn "$SHARED_DIR/admin_panel/.env" "$RELEASE_DIR/admin_panel/.env"
ln -sfn "$SHARED_DIR/backend/.env" "$RELEASE_DIR/backend/.env"
rm -rf "$RELEASE_DIR/backend/uploads"
ln -sfn "$SHARED_DIR/uploads" "$RELEASE_DIR/backend/uploads"

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

pm2 startOrReload "$CURRENT_LINK/deploy/pm2/ecosystem.production.cjs" --update-env
pm2 save

ls -1dt "$RELEASES_DIR"/* 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" | xargs -r rm -rf
rm -f "$ARCHIVE_PATH"
