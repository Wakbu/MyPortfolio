#!/usr/bin/env bash
# Public portfolio copy: private addresses are replaced with documentation ranges.
set -uo pipefail

CONFIG_FILE="${CONFIG_FILE:-/etc/security-lab/soc-health.env}"
[[ -r "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

LOG_FILE="${LOG_FILE:-/var/log/security-lab/soc-health.json}"
DISK_WARN_PERCENT="${DISK_WARN_PERCENT:-80}"
MEM_WARN_PERCENT="${MEM_WARN_PERCENT:-85}"
SERVICES="${SERVICES:-security-lab-firewall snort-ips wazuh-manager wazuh-indexer wazuh-dashboard filebeat haproxy}"
PEERS="${PEERS:-web=192.0.2.11 db=192.0.2.13}"
EXPECTED_PORTS="${EXPECTED_PORTS:-22 443 1514 1515 3000 9090 8443}"

install -d -m 0750 "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"; chmod 0640 "$LOG_FILE"
failures=0; warnings=0

escape() { local s=${1//\\/\\\\}; s=${s//\"/\\\"}; printf '%s' "$s"; }
emit() {
  local severity="$1" component="$2" status="$3" message="$4"
  [[ "$severity" == critical ]] && ((failures++))
  [[ "$severity" == warning ]] && ((warnings++))
  printf '{"timestamp":"%s","program":"soc_health_check","severity":"%s","component":"%s","status":"%s","message":"%s"}\n' \
    "$(date --iso-8601=seconds)" "$severity" "$(escape "$component")" "$status" "$(escape "$message")" | tee -a "$LOG_FILE"
}

check_http() {
  local component="$1" url="$2"
  curl -fsS --max-time 7 "$url" >/dev/null 2>&1 \
    && emit info "$component" ok "$url is responding" \
    || emit critical "$component" failed "$url is not responding"
}

check_tcp() {
  local component="$1" host="$2" port="$3"
  timeout 5 bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1 \
    && emit info "$component" ok "$host:$port is reachable" \
    || emit critical "$component" failed "$host:$port is not reachable"
}

for service in $SERVICES; do
  systemctl is-active --quiet "$service" \
    && emit info "service:$service" ok "service is active" \
    || emit critical "service:$service" failed "service is not active"
done

rules=$(nft list ruleset 2>/dev/null || true)
grep -Eq 'hook input.*policy drop|policy drop.*hook input' <<<"$rules" \
  && emit info firewall ok "default-drop policy found" \
  || emit critical firewall failed "default-drop policy not found"

for item in $PEERS; do
  name=${item%%=*}; ip=${item#*=}
  ping -c 1 -W 3 "$ip" >/dev/null 2>&1 \
    && emit info "peer:$name" ok "peer is reachable" \
    || emit critical "peer:$name" failed "peer is unreachable"
done

check_http remote:web http://192.0.2.11/
check_tcp remote:database 192.0.2.13 3306

listeners=$(ss -H -lnt 2>/dev/null || true)
for port in $EXPECTED_PORTS; do
  grep -Eq "[:.]${port}[[:space:]]" <<<"$listeners" \
    && emit info "port:$port" ok "TCP port is listening" \
    || emit warning "port:$port" missing "expected listener not found"
done

disk_used=$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
(( disk_used >= DISK_WARN_PERCENT )) \
  && emit warning disk warning "root usage ${disk_used}%" \
  || emit info disk ok "root usage ${disk_used}%"

mem_used=$(awk '/MemTotal/{t=$2}/MemAvailable/{a=$2}END{printf "%.0f",(t-a)*100/t}' /proc/meminfo)
(( mem_used >= MEM_WARN_PERCENT )) \
  && emit warning memory warning "memory usage ${mem_used}%" \
  || emit info memory ok "memory usage ${mem_used}%"

emit info summary "$([[ $failures -eq 0 ]] && echo ok || echo failed)" "critical=$failures warning=$warnings"
(( failures == 0 ))
