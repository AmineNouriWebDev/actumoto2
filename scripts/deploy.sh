#!/bin/bash
set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: $0 <staging|prod>"
  exit 1
fi

echo "Deploying $ENV environment..."

git pull origin main

docker compose -f docker-compose.$ENV.yml build
docker compose -f docker-compose.$ENV.yml up -d

echo "Deployment for $ENV completed successfully."
