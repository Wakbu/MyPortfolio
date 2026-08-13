#!/usr/bin/env bash
# NextBank 관제 서버에서 Wazuh 계열 서비스를 한 번에 점검·복구하기 위해 작성한 스크립트다.
# 이 파일은 포트폴리오 공개용 사본이다. 실제 서버 식별 정보, 계정 정보,
# Discord Webhook 등 환경에 종속되는 값은 모두 제외하고 복구 로직만 남겼다.
set -u

# 장애 대응 내역은 터미널 출력으로 끝내지 않고 한 파일에 누적한다.
# 나중에 장애 시각과 조치 순서를 맞춰볼 때 이 로그를 기준으로 확인했다.
HOSTNAME_VALUE="$(hostname)"
LOG_DIR="/var/log/incident-response"
LOG_FILE="${LOG_DIR}/recovery.log"
ALERT_FILE="/var/ossec/logs/alerts/alerts.json"

mkdir -p "$LOG_DIR"

log_msg() {
    local level="$1" message="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [${level}] ${HOSTNAME_VALUE} ${message}" | tee -a "$LOG_FILE"
}

# 서버마다 설치된 구성요소가 달라 존재하지 않는 서비스를 무조건 재시작하지 않는다.
service_exists() {
    systemctl list-unit-files "${1}.service" >/dev/null 2>&1
}

# 재시작 명령이 성공했더라도 실제 상태가 active인지 다시 확인한다.
# 실패했을 때는 status 마지막 20줄을 함께 남겨 별도의 접속 없이 원인을 볼 수 있게 했다.
restart_if_exists() {
    local service_name="$1"
    if service_exists "$service_name"; then
        log_msg INFO "${service_name} restart started."
        systemctl restart "$service_name"
        sleep 3
        if systemctl is-active --quiet "$service_name"; then
            log_msg OK "${service_name} is active after restart."
        else
            log_msg ERROR "${service_name} is still inactive."
            systemctl status "$service_name" --no-pager | tail -n 20 | tee -a "$LOG_FILE"
        fi
    else
        log_msg SKIP "${service_name} unit not found."
    fi
}

# 프로세스가 active여도 실제 서비스 포트가 열리지 않을 수 있어 별도로 검사한다.
check_port() {
    local port="$1" name="$2"
    if ss -tuln | awk '{print $5}' | grep -qE "(:|\.)${port}$"; then
        log_msg OK "${name} port ${port} is listening."
    else
        log_msg ERROR "${name} port ${port} is not listening."
    fi
}

# alerts.json의 수정 시각은 Wazuh가 이벤트를 계속 기록하고 있는지 확인하는 보조 지표다.
# 실습 환경에서는 30분 이상 갱신이 없으면 수집 중단 가능성이 있다고 보고 경고로 처리했다.
check_alert_file() {
    if [[ ! -f "$ALERT_FILE" ]]; then
        log_msg ERROR "Wazuh alert file not found."
        return
    fi
    local age=$(( $(date +%s) - $(stat -c %Y "$ALERT_FILE") ))
    if (( age > 1800 )); then
        log_msg WARNING "alerts.json has not been updated for more than 30 minutes."
    else
        log_msg OK "alerts.json update time looks normal."
    fi
}

log_msg INFO "Wazuh recovery started."

# indexer가 준비되지 않은 상태에서 manager와 dashboard를 먼저 올리면 연결 오류가 반복됐다.
# 그래서 저장소 → 수집기 → 전달기 → 화면 순서로 재시작한다.
restart_if_exists wazuh-indexer
restart_if_exists wazuh-manager
restart_if_exists filebeat
restart_if_exists wazuh-dashboard

# 서비스 상태와 실제 리스닝 상태를 함께 확인한 뒤 경보 파일 갱신 여부까지 검사한다.
check_port 55000 "Wazuh API"
check_port 443 "Wazuh Dashboard HTTPS"
check_alert_file
log_msg INFO "Wazuh recovery finished."
