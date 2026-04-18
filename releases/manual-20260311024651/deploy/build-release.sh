#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_NAME="${1:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
BUILD_ROOT="$ROOT_DIR/.release"
RELEASE_DIR="$BUILD_ROOT/$RELEASE_NAME"
ARCHIVE_PATH="$BUILD_ROOT/${RELEASE_NAME}.tar.gz"

rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/frontend/.next" "$RELEASE_DIR/admin_panel/.next" "$RELEASE_DIR/backend"

# Frontend standalone bundle
cp -R "$ROOT_DIR/frontend/public" "$RELEASE_DIR/frontend/public"
cp -R "$ROOT_DIR/frontend/.next/standalone/." "$RELEASE_DIR/frontend/"
cp -R "$ROOT_DIR/frontend/.next/static" "$RELEASE_DIR/frontend/.next/static"

# Admin standalone bundle
cp -R "$ROOT_DIR/admin_panel/public" "$RELEASE_DIR/admin_panel/public"
cp -R "$ROOT_DIR/admin_panel/.next/standalone/." "$RELEASE_DIR/admin_panel/"
cp -R "$ROOT_DIR/admin_panel/.next/static" "$RELEASE_DIR/admin_panel/.next/static"

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
