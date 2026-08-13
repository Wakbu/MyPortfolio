#!/usr/bin/env bash
# EstMall 보안 게이트웨이와 관제 구성요소를 5분마다 점검하기 위해 사용한 스크립트다.
# 이 파일은 포트폴리오 공개용 사본이며 실제 서버 주소와 내부 호스트명은 제거했다.
# 아래 192.0.2.0/24 주소는 RFC 5737에서 문서와 예제용으로 예약한 TEST-NET-1 대역이다.
# 실제 운영 주소가 아니며, 배포 환경에서는 /etc/security-lab/soc-health.env에서 값을 주입한다.
set -uo pipefail

# 점검 대상과 임계값은 코드 수정 없이 바꿀 수 있도록 환경 파일에서 읽는다.
# 환경 파일이 없을 때만 아래 기본값을 사용한다.
CONFIG_FILE="${CONFIG_FILE:-/etc/security-lab/soc-health.env}"
[[ -r "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

LOG_FILE="${LOG_FILE:-/var/log/security-lab/soc-health.json}"
DISK_WARN_PERCENT="${DISK_WARN_PERCENT:-80}"
MEM_WARN_PERCENT="${MEM_WARN_PERCENT:-85}"
SERVICES="${SERVICES:-security-lab-firewall snort-ips wazuh-manager wazuh-indexer wazuh-dashboard filebeat haproxy}"
# 공개본 기본값은 동작 구조를 보여주기 위한 예시다. 실제 주소는 환경 파일에서 PEERS를 덮어쓴다.
PEERS="${PEERS:-web=192.0.2.11 db=192.0.2.13}"
EXPECTED_PORTS="${EXPECTED_PORTS:-22 443 1514 1515 3000 9090 8443}"
WEB_CHECK_URL="${WEB_CHECK_URL:-http://192.0.2.11/}"
DB_CHECK_HOST="${DB_CHECK_HOST:-192.0.2.13}"
DB_CHECK_PORT="${DB_CHECK_PORT:-3306}"

install -d -m 0750 "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"; chmod 0640 "$LOG_FILE"

# 전체 검사가 끝난 뒤 한 번에 상태를 판단하기 위해 심각·경고 건수를 누적한다.
failures=0; warnings=0

# 결과는 Wazuh가 한 줄씩 수집하기 쉬운 JSON Lines 형식으로 남긴다.
# 메시지 안의 따옴표와 역슬래시가 JSON 구조를 깨지 않도록 최소한의 이스케이프를 적용한다.
escape() { local s=${1//\\/\\\\}; s=${s//\"/\\\"}; printf '%s' "$s"; }
emit() {
  local severity="$1" component="$2" status="$3" message="$4"
  [[ "$severity" == critical ]] && ((failures++))
  [[ "$severity" == warning ]] && ((warnings++))
  printf '{"timestamp":"%s","program":"soc_health_check","severity":"%s","component":"%s","status":"%s","message":"%s"}\n' \
    "$(date --iso-8601=seconds)" "$severity" "$(escape "$component")" "$status" "$(escape "$message")" | tee -a "$LOG_FILE"
}

# HTTP는 연결 여부만 보지 않고 정상 응답까지 받아야 성공으로 처리한다.
# 7초 안에 응답하지 않으면 다음 항목 점검이 밀리지 않도록 실패로 기록한다.
check_http() {
  local component="$1" url="$2"
  curl -fsS --max-time 7 "$url" >/dev/null 2>&1 \
    && emit info "$component" ok "$url is responding" \
    || emit critical "$component" failed "$url is not responding"
}

# 웹 화면이 없는 DB 같은 서비스는 bash의 /dev/tcp로 포트 도달 여부를 확인한다.
check_tcp() {
  local component="$1" host="$2" port="$3"
  timeout 5 bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1 \
    && emit info "$component" ok "$host:$port is reachable" \
    || emit critical "$component" failed "$host:$port is not reachable"
}

# systemd 서비스가 내려가 있으면 관제 공백으로 이어지므로 critical로 분류한다.
for service in $SERVICES; do
  systemctl is-active --quiet "$service" \
    && emit info "service:$service" ok "service is active" \
    || emit critical "service:$service" failed "service is not active"
done

# 방화벽 프로세스 실행 여부만으로는 정책 적용을 보장할 수 없다.
# 실제 nftables ruleset에서 INPUT 기본 차단 정책이 남아 있는지 확인한다.
rules=$(nft list ruleset 2>/dev/null || true)
grep -Eq 'hook input.*policy drop|policy drop.*hook input' <<<"$rules" \
  && emit info firewall ok "default-drop policy found" \
  || emit critical firewall failed "default-drop policy not found"

# 같은 보안망에 있는 웹·DB 서버가 살아 있는지 먼저 ICMP로 빠르게 확인한다.
# 상세 서비스 검사는 아래 HTTP/TCP 검사에서 다시 수행한다.
for item in $PEERS; do
  name=${item%%=*}; ip=${item#*=}
  ping -c 1 -W 3 "$ip" >/dev/null 2>&1 \
    && emit info "peer:$name" ok "peer is reachable" \
    || emit critical "peer:$name" failed "peer is unreachable"
done

# 실제 배포에서는 URL과 DB 주소도 환경 파일에서 전달한다.
# 코드에 남은 기본값은 공개 문서 전용 예시이므로 실제 시스템으로 연결되지 않는다.
check_http remote:web "$WEB_CHECK_URL"
check_tcp remote:database "$DB_CHECK_HOST" "$DB_CHECK_PORT"

# 예상 포트 목록과 실제 LISTEN 소켓을 비교한다.
# 포트 하나가 없다고 전체 관제가 중단된 것은 아니므로 이 항목은 warning으로 남긴다.
listeners=$(ss -H -lnt 2>/dev/null || true)
for port in $EXPECTED_PORTS; do
  grep -Eq "[:.]${port}[[:space:]]" <<<"$listeners" \
    && emit info "port:$port" ok "TCP port is listening" \
    || emit warning "port:$port" missing "expected listener not found"
done

# 디스크와 메모리는 장애가 발생하기 전에 확인할 수 있도록 임계치 초과를 경고로 분류했다.
# 기본값은 프로젝트에서 사용한 디스크 80%, 메모리 85%다.
disk_used=$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
(( disk_used >= DISK_WARN_PERCENT )) \
  && emit warning disk warning "root usage ${disk_used}%" \
  || emit info disk ok "root usage ${disk_used}%"

mem_used=$(awk '/MemTotal/{t=$2}/MemAvailable/{a=$2}END{printf "%.0f",(t-a)*100/t}' /proc/meminfo)
(( mem_used >= MEM_WARN_PERCENT )) \
  && emit warning memory warning "memory usage ${mem_used}%" \
  || emit info memory ok "memory usage ${mem_used}%"

# 각 항목의 상세 로그 뒤에 요약 한 줄을 남긴다.
# critical이 하나라도 있으면 종료 코드 1을 반환해 cron이나 상위 점검 도구에서도 실패를 알 수 있다.
emit info summary "$([[ $failures -eq 0 ]] && echo ok || echo failed)" "critical=$failures warning=$warnings"
(( failures == 0 ))
