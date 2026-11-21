#!/bin/bash
set -eo pipefail

CONTAINER_NAME="${DB_CONTAINER:-actumoto_db_staging}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-actumoto}"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups/db}"

echo "=========================================================="
echo "      ACTUMOTO - RESTAURATION DE LA BASE DE DONNÉES       "
echo "=========================================================="

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Erreur: Le dossier des sauvegardes $BACKUP_DIR n'existe pas."
  exit 1
fi

BACKUP_ARG=$1

if [ -z "$BACKUP_ARG" ]; then
  echo "Sauvegardes disponibles dans $BACKUP_DIR :"
  echo "----------------------------------------------------------"
  ls -lh "$BACKUP_DIR"/actumoto_*.sql.gz 2>/dev/null || { echo "Aucune sauvegarde trouvée."; exit 1; }
  echo "----------------------------------------------------------"
  echo "Usage: $0 <lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|latest|fichier.sql.gz>"
  echo "Exemples:"
  echo "  $0 lundi"
  echo "  $0 latest"
  echo "  $0 $BACKUP_DIR/actumoto_lundi.sql.gz"
  exit 1
fi

# Résolution du fichier de sauvegarde
if [ "$BACKUP_ARG" = "latest" ]; then
  BACKUP_FILE="$BACKUP_DIR/latest.sql.gz"
elif [ -f "$BACKUP_ARG" ]; then
  BACKUP_FILE="$BACKUP_ARG"
elif [ -f "$BACKUP_DIR/actumoto_${BACKUP_ARG}.sql.gz" ]; then
  BACKUP_FILE="$BACKUP_DIR/actumoto_${BACKUP_ARG}.sql.gz"
elif [ -f "$BACKUP_DIR/${BACKUP_ARG}" ]; then
  BACKUP_FILE="$BACKUP_DIR/${BACKUP_ARG}"
else
  echo "Erreur: Impossible de trouver la sauvegarde '$BACKUP_ARG'."
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Erreur: Le fichier $BACKUP_FILE n'existe pas."
  exit 1
fi

# Vérifier si le conteneur PostgreSQL est actif
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Erreur: Le conteneur PostgreSQL $CONTAINER_NAME n'est pas actif !"
  exit 1
fi

REAL_FILE=$(readlink -f "$BACKUP_FILE")
FILE_SIZE=$(du -h "$REAL_FILE" | cut -f1)
echo "Fichier de sauvegarde : $REAL_FILE ($FILE_SIZE)"
echo "Base cible            : $DB_NAME sur $CONTAINER_NAME"
echo ""

# Confirmation de sécurité
if [ "$2" != "-y" ] && [ "$2" != "--yes" ]; then
  read -p "⚠️  ATTENTION : La base actuelle va être écrasée par cette sauvegarde. Continuer ? (oui/non) : " CONFIRM
  if [ "$CONFIRM" != "oui" ] && [ "$CONFIRM" != "o" ] && [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "yes" ]; then
    echo "Restauration annulée."
    exit 0
  fi
fi

echo "Restauration en cours..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

echo "✅ Restauration terminée avec succès !"
