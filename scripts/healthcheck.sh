#!/usr/bin/env bash
# healthcheck.sh — check all VaidyaMarg service endpoints are responding
# Usage: ./scripts/healthcheck.sh
# Run after `docker compose up --build` to verify all services are healthy.
set -e

PASS=0
FAIL=0

check() {
  local name=$1
  local url=$2
  local expected=${3:-200}

  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")

  if [[ "$code" == "$expected" ]]; then
    echo "  ✅  $name ($url) → HTTP $code"
    ((PASS++))
  else
    echo "  ❌  $name ($url) → HTTP $code (expected $expected)"
    ((FAIL++))
  fi
}

echo ""
echo "💉 VaidyaMarg Service Healthcheck"
echo "================================"

check "NestJS API"          "http://localhost:3000/health"
check "Swagger Docs"        "http://localhost:3000/api/docs" "200"
check "OCR Service"         "http://localhost:8000/health"
check "AI Service (stub)"   "http://localhost:8001/health"
check "Admin Dashboard"     "http://localhost:5173" "200"

echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"

if [[ $FAIL -gt 0 ]]; then
  echo "⚠️  Some services are not healthy. Run: docker compose logs"
  exit 1
fi

echo "✅  All services healthy!"
