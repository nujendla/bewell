#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="beingwell-rls-test-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker run --name "$container" -e POSTGRES_PASSWORD=disposable-local-test-only -d postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24 >/dev/null
for attempt in {1..30}; do
 if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
 sleep 1
done
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database-bootstrap.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/001_initial.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/database-policies.sql
