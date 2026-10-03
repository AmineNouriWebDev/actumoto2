#!/bin/bash
set -e

echo "Syncing database..."
docker exec -i actumoto-db pg_dump -U postgres -d actumoto -c -O | ssh -o StrictHostKeyChecking=no -i /home/maxsolving/.ssh/id_ed25519_actumoto ubuntu@164.132.199.48 'sudo docker exec -i actumoto_db_staging psql -U postgres -d actumoto'

echo "Syncing images..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i /home/maxsolving/.ssh/id_ed25519_actumoto" public/img/ ubuntu@164.132.199.48:/tmp/img_sync/

echo "Moving images to volume and fixing permissions..."
ssh -o StrictHostKeyChecking=no -i /home/maxsolving/.ssh/id_ed25519_actumoto ubuntu@164.132.199.48 'sudo docker run --rm -v actumoto2_uploads_staging:/target -v /tmp/img_sync:/source alpine sh -c "cp -r /source/. /target/ && chown -R 1001:1001 /target"'

echo "Sync complete."
