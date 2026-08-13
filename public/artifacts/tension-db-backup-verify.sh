#!/usr/bin/env bash
# DB 백업 파일이 생성됐다는 사실만 확인하지 않고, 실제 복원까지 검증하기 위해 만든 스크립트다.
# 이 파일은 포트폴리오 공개용 사본으로 실제 DB명, 서버 주소, 계정과 비밀번호는 포함하지 않았다.
# 운영 환경에서는 권한이 제한된 설정 파일과 /root/.my.cnf를 통해 필요한 값을 전달한다.
set -Eeuo pipefail

# 데이터베이스명과 보관 경로는 서버별로 달라질 수 있어 환경 파일로 분리했다.
CONFIG_FILE="${CONFIG_FILE:-/etc/security-lab/db-backup.env}"
[[ -r "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

DATABASE="${DATABASE:?Set DATABASE in $CONFIG_FILE}"
MYSQL_DEFAULTS_FILE="${MYSQL_DEFAULTS_FILE:-/root/.my.cnf}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/security-lab/mysql}"
LOG_FILE="${LOG_FILE:-/var/log/security-lab/db-backup-verify.json}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# 변수값이 셸 명령이나 삭제 범위로 이어지므로 작업 전에 허용 범위를 먼저 검사한다.
# 특히 BACKUP_DIR이 / 또는 /var로 잘못 들어가면 보존 기간 정리 단계가 위험해질 수 있다.
[[ "$DATABASE" =~ ^[A-Za-z0-9_]+$ ]] || exit 2
[[ "$BACKUP_DIR" == /* && "$BACKUP_DIR" != / && "$BACKUP_DIR" != /var ]] || exit 2
[[ -r "$MYSQL_DEFAULTS_FILE" ]] || { echo "Missing protected credential file" >&2; exit 2; }

install -d -m 0700 "$BACKUP_DIR"
install -d -m 0750 "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"; chmod 0600 "$LOG_FILE"

# 같은 날 여러 번 실행해도 파일과 검증용 DB 이름이 겹치지 않도록 초 단위 시각을 붙인다.
stamp=$(date +%Y%m%d_%H%M%S)
backup="$BACKUP_DIR/${DATABASE}_${stamp}.sql.gz"
checksum="$backup.sha256"
verify_db="verify_${DATABASE}_${stamp}"
start=$(date +%s)
created_verify_db=0

# 백업 크기와 전체 소요 시간을 같이 남겨 이전 실행과 비교할 수 있게 했다.
emit() {
  local status="$1" message="$2" size=0
  [[ -f "$backup" ]] && size=$(stat -c '%s' "$backup")
  printf '{"timestamp":"%s","program":"db_backup_verify","status":"%s","bytes":%s,"duration_seconds":%s,"message":"%s"}\n' \
    "$(date --iso-8601=seconds)" "$status" "$size" "$(( $(date +%s) - start ))" "$message" | tee -a "$LOG_FILE"
}

# 복원 도중 실패하더라도 검증용 DB가 서버에 남지 않도록 EXIT 시점에 정리한다.
cleanup() {
  (( created_verify_db )) && mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" \
    -e "DROP DATABASE IF EXISTS \`$verify_db\`;" >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'emit failed "backup or restore verification failed"; exit 1' ERR

# 서비스 중단 없이 백업하기 위해 single-transaction을 사용한다.
# gzip 자체 검사와 SHA-256 검사를 연속으로 수행해 압축 손상과 파일 변조 여부를 확인한다.
mysqldump --defaults-extra-file="$MYSQL_DEFAULTS_FILE" \
  --single-transaction --quick --routines --events --triggers --hex-blob "$DATABASE" | gzip -9 > "$backup"
chmod 0600 "$backup"
gzip -t "$backup"
sha256sum "$backup" > "$checksum"
sha256sum -c "$checksum" >/dev/null

# 백업 성공 여부의 핵심은 파일 존재가 아니라 복원 가능 여부다.
# 임시 DB를 만든 뒤 백업본을 직접 주입하고, 테이블이 실제로 생성됐는지 확인한다.
mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" -e "CREATE DATABASE \`$verify_db\`;"
created_verify_db=1
gzip -cd "$backup" | mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" "$verify_db"

table_count=$(mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$verify_db';")
(( table_count > 0 )) || { emit failed "restore completed but no tables were found"; exit 1; }

emit success "backup integrity and restore verified; restored_tables=$table_count"

# 정리 범위는 검증된 BACKUP_DIR 아래의 백업·체크섬 파일로 한정한다.
# 프로젝트 운영 기준에 따라 기본 14일이 지난 파일만 제거한다.
find "$BACKUP_DIR" -xdev -type f \( -name '*.sql.gz' -o -name '*.sha256' \) -mtime "+$RETENTION_DAYS" -delete
