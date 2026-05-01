#!/usr/bin/env bash
# wait-for-it.sh — wait for a host:port to become available
# Usage: ./scripts/wait-for-it.sh host:port [-t timeout] [-- command args]
# Based on the widely-used wait-for-it pattern.
set -e

HOST=""
PORT=""
TIMEOUT=30
CMD=()

usage() {
  echo "Usage: $0 host:port [-t timeout] [-- command args]"
  exit 1
}

[[ $# -eq 0 ]] && usage

HOSTPORT=$1; shift
HOST=$(echo "$HOSTPORT" | cut -d: -f1)
PORT=$(echo "$HOSTPORT" | cut -d: -f2)

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t) TIMEOUT=$2; shift 2 ;;
    --) shift; CMD=("$@"); break ;;
    *)  shift ;;
  esac
done

echo "[wait-for-it] Waiting up to ${TIMEOUT}s for ${HOST}:${PORT}..."

for i in $(seq 1 "$TIMEOUT"); do
  if bash -c "</dev/tcp/${HOST}/${PORT}" 2>/dev/null; then
    echo "[wait-for-it] ${HOST}:${PORT} is available after ${i}s"
    [[ ${#CMD[@]} -gt 0 ]] && exec "${CMD[@]}"
    exit 0
  fi
  sleep 1
done

echo "[wait-for-it] Timeout: ${HOST}:${PORT} not available after ${TIMEOUT}s" >&2
exit 1
