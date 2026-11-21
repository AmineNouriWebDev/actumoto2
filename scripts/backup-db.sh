#!/bin/bash
set -eo pipefail

# Configuration
CONTAINER_NAME="${DB_CONTAINER:-actumoto_db_staging}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-actumoto}"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups/db}"

# Création du dossier de sauvegarde si nécessaire
mkdir -p "$BACKUP_DIR"

# Déterminer le jour de la semaine en français (1=lundi ... 7=dimanche)
DAY_NUM=$(date +%u)
case "$DAY_NUM" in
  1) DAY_NAME="lundi" ;;
  2) DAY_NAME="mardi" ;;
  3) DAY_NAME="mercredi" ;;
  4) DAY_NAME="jeudi" ;;
  5) DAY_NAME="vendredi" ;;
  6) DAY_NAME="samedi" ;;
  7) DAY_NAME="dimanche" ;;
  *) DAY_NAME="backup" ;;
esac

TARGET_FILE="$BACKUP_DIR/actumoto_${DAY_NAME}.sql.gz"
TEMP_FILE="$BACKUP_DIR/.tmp_${DAY_NAME}_$(date +%s).sql.gz"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] === Début de la sauvegarde de la base de données Actumoto ($DAY_NAME) ==="

# Vérifier si le conteneur PostgreSQL est actif
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[$TIMESTAMP] ERREUR: Le conteneur $CONTAINER_NAME n'est pas actif !" >&2
  exit 1
fi

# Dump de la base vers un fichier temporaire
if docker exec -i "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$TEMP_FILE"; then
  FILE_SIZE=$(wc -c < "$TEMP_FILE" || echo 0)
  if [ "$FILE_SIZE" -gt 1024 ]; then
    # Remplacement atomique de la sauvegarde du jour (écrase celle de la semaine dernière)
    mv -f "$TEMP_FILE" "$TARGET_FILE"
    chmod 640 "$TARGET_FILE"

    # Mise à jour du lien symbolique vers la dernière sauvegarde
    ln -sf "actumoto_${DAY_NAME}.sql.gz" "$BACKUP_DIR/latest.sql.gz"

    HUMAN_SIZE=$(du -h "$TARGET_FILE" | cut -f1)
    echo "[$TIMESTAMP] SUCCÈS: Sauvegarde $DAY_NAME terminée ($TARGET_FILE - $HUMAN_SIZE)."
  else
    echo "[$TIMESTAMP] ERREUR: Fichier de sauvegarde anormalement petit ($FILE_SIZE octets) !" >&2
    rm -f "$TEMP_FILE"
    exit 1
  fi
else
  echo "[$TIMESTAMP] ERREUR: Échec lors de la commande pg_dump !" >&2
  rm -f "$TEMP_FILE"
  exit 1
fi

echo "[$TIMESTAMP] === Sauvegarde terminée avec succès ==="
