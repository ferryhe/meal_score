#!/usr/bin/env bash
set -euo pipefail

docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose up -d --build app
