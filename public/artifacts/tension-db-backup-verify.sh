#!/usr/bin/env bash
# Public portfolio copy: database credentials remain in a separate protected file.
set -Eeuo pipefail

CONFIG_FILE="${CONFIG_FILE:-/etc/security-lab/db-backup.env}"
[[ -r "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

DATABASE="${DATABASE:?Set DATABASE in $CONFIG_FILE}"
MYSQL_DEFAULTS_FILE="${MYSQL_DEFAULTS_FILE:-/root/.my.cnf}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/security-lab/mysql}"
LOG_FILE="${LOG_FILE:-/var/log/security-lab/db-backup-verify.json}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

[[ "$DATABASE" =~ ^[A-Za-z0-9_]+$ ]] || exit 2
[[ "$BACKUP_DIR" == /* && "$BACKUP_DIR" != / && "$BACKUP_DIR" != /var ]] || exit 2
[[ -r "$MYSQL_DEFAULTS_FILE" ]] || { echo "Missing protected credential file" >&2; exit 2; }

install -d -m 0700 "$BACKUP_DIR"
install -d -m 0750 "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"; chmod 0600 "$LOG_FILE"

stamp=$(date +%Y%m%d_%H%M%S)
backup="$BACKUP_DIR/${DATABASE}_${stamp}.sql.gz"
checksum="$backup.sha256"
verify_db="verify_${DATABASE}_${stamp}"
start=$(date +%s)
created_verify_db=0

emit() {
  local status="$1" message="$2" size=0
  [[ -f "$backup" ]] && size=$(stat -c '%s' "$backup")
  printf '{"timestamp":"%s","program":"db_backup_verify","status":"%s","bytes":%s,"duration_seconds":%s,"message":"%s"}\n' \
    "$(date --iso-8601=seconds)" "$status" "$size" "$(( $(date +%s) - start ))" "$message" | tee -a "$LOG_FILE"
}

cleanup() {
  (( created_verify_db )) && mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" \
    -e "DROP DATABASE IF EXISTS \`$verify_db\`;" >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'emit failed "backup or restore verification failed"; exit 1' ERR

mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE" \
  --single-transaction --quick --routines --events --triggers --hex-blob "$DATABASE" | gzip -9 > "$backup"
chmod 0600 "$backup"
gzip -t "$backup"
sha256sum "$backup" > "$checksum"
sha256sum -c "$checksum" >/dev/null

mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" -e "CREATE DATABASE \`$verify_db\`;"
created_verify_db=1
gzip -cd "$backup" | mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" "$verify_db"

table_count=$(mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$verify_db';")
(( table_count > 0 )) || { emit failed "restore completed but no tables were found"; exit 1; }

emit success "backup integrity and restore verified; restored_tables=$table_count"
find "$BACKUP_DIR" -xdev -type f \( -name '*.sql.gz' -o -name '*.sha256' \) -mtime "+$RETENTION_DAYS" -delete
