#!/bin/bash
set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: $0 <staging|prod>"
  exit 1
fi

echo "Deploying $ENV environment..."

git pull origin main

# Sync static images from repo public/img to uploads volume if needed
VOLUME_NAME="actumoto2_uploads_${ENV}"
docker run --rm -v ${VOLUME_NAME}:/target -v "$(pwd)/public/img":/source alpine sh -c "cp -rn /source/. /target/ 2>/dev/null || true; chown -R 1001:1001 /target 2>/dev/null || true"

docker compose -f docker-compose.$ENV.yml build
docker compose -f docker-compose.$ENV.yml up -d

echo "Deployment for $ENV completed successfully."
