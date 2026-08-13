#!/usr/bin/env bash
# Public portfolio copy: credentials and notification endpoints are not included.
set -u

HOSTNAME_VALUE="$(hostname)"
LOG_DIR="/var/log/incident-response"
LOG_FILE="${LOG_DIR}/recovery.log"
ALERT_FILE="/var/ossec/logs/alerts/alerts.json"

mkdir -p "$LOG_DIR"

log_msg() {
    local level="$1" message="$2"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [${level}] ${HOSTNAME_VALUE} ${message}" | tee -a "$LOG_FILE"
}

service_exists() {
    systemctl list-unit-files "${1}.service" >/dev/null 2>&1
}

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

check_port() {
    local port="$1" name="$2"
    if ss -tuln | awk '{print $5}' | grep -qE "(:|\.)${port}$"; then
        log_msg OK "${name} port ${port} is listening."
    else
        log_msg ERROR "${name} port ${port} is not listening."
    fi
}

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
restart_if_exists wazuh-indexer
restart_if_exists wazuh-manager
restart_if_exists filebeat
restart_if_exists wazuh-dashboard
check_port 55000 "Wazuh API"
check_port 443 "Wazuh Dashboard HTTPS"
check_alert_file
log_msg INFO "Wazuh recovery finished."
