#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "Missing .env file. Copy .env.example to .env and fill in values."
  exit 1
fi

docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose up -d --build app

echo "Deployment complete."
echo "Check status with: docker compose ps"
