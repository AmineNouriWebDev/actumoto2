#!/bin/bash
set -e

echo "Syncing database..."
PGPASSWORD=password pg_dump -U postgres -h 127.0.0.1 -p 5432 -d actumoto -c -O | ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519_actumoto ubuntu@164.132.199.48 'sudo docker exec -i actumoto_db_staging psql -U postgres -d actumoto'

echo "Syncing images..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519_actumoto" public/img/ ubuntu@164.132.199.48:/tmp/img_sync/

echo "Moving images to volume..."
ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519_actumoto ubuntu@164.132.199.48 'sudo docker run --rm -v actumoto2_uploads_staging:/target -v /tmp/img_sync:/source alpine cp -r /source/. /target/'

echo "Sync complete."
