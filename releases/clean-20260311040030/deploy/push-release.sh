#!/usr/bin/env bash

set -euo pipefail

ARCHIVE_PATH="${1:?archive path required}"
DEPLOY_HOST="${DEPLOY_HOST:-72.61.93.212}"
DEPLOY_USER="${DEPLOY_USER:-orhan}"
DEPLOY_BASE="${DEPLOY_BASE:-/var/www/kamanilan}"
RELEASE_NAME="${RELEASE_NAME:-$(basename "$ARCHIVE_PATH" .tar.gz)}"

scp "$ARCHIVE_PATH" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_BASE}/tmp/${RELEASE_NAME}.tar.gz"
scp "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/server/install-release.sh" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_BASE}/tmp/install-release.sh"

ssh "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "chmod +x '${DEPLOY_BASE}/tmp/install-release.sh' && \
   KEEP_RELEASES=5 '${DEPLOY_BASE}/tmp/install-release.sh' \
   '${DEPLOY_BASE}' \
   '${DEPLOY_BASE}/tmp/${RELEASE_NAME}.tar.gz' \
   '${RELEASE_NAME}'"
