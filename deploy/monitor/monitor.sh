#!/bin/sh
# ============================================================
# DKXaiLBY 博客 · 宿主机自检脚本 (cron 每分钟跑一次)
# 探活: HTTP 打 /api/front/status (顺带验证 DB 链路, 因为接口内部要 COUNT)
# 检查: 宿主机内存 / 磁盘占用
# 状态机: OK<->FAIL 只在状态翻转时记一次日志, 不刷屏; 每次结果写 Redis 供状态页展示
# (v3.46: 推送渠道已移除 —— 用户不需要告警推送, 状态页可见即可)
#
# 日志: /opt/blog/monitor/monitor.log (只记状态翻转和错误, 很小)
# ============================================================

MONITOR_DIR="/opt/blog/monitor"
STATE_FILE="$MONITOR_DIR/state"
LOG_FILE="$MONITOR_DIR/monitor.log"
PROBE_URL="http://127.0.0.1:8081/api/front/status"
REDIS_CONTAINER="gvb-redis"
MEM_THRESHOLD_MB=100   # 可用内存低于此值告警
DISK_THRESHOLD=90      # 根分区使用率高于此百分比告警

mkdir -p "$MONITOR_DIR"

# ---- 写 Redis 供状态页展示 (Redis 挂了不影响主流程) ----
# 密码不进本脚本: 从部署 .env 里运行时发现鉴权变量并临时 source, 用完即弃
# 注意 -n 7: 后端应用用的就是 Redis DB 7 (config.docker.yml Redis.DB)
write_redis() {
    local json="$1"
    local env_file="/opt/blog/deploy/start/.env"
    if [ ! -f "$env_file" ]; then
        echo "$(date '+%F %T') [WARN] 找不到 $env_file, 跳过写 Redis" >> "$LOG_FILE"
        return 1
    fi
    # 运行时从 .env 里找出 redis 鉴权变量名并取值 (变量名不硬编码在脚本里)
    local auth_var auth_val
    auth_var=$(grep -oE '^REDIS_PASS[A-Z_]*' "$env_file" | head -1)
    if [ -z "$auth_var" ]; then
        echo "$(date '+%F %T') [WARN] .env 里没找到 redis 鉴权变量" >> "$LOG_FILE"
        return 1
    fi
    auth_val=$(grep -E "^${auth_var}=" "$env_file" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    if printf '%s' "$json" | REDISCLI_AUTH="$auth_val" docker exec -i -e REDISCLI_AUTH="$auth_val" "$REDIS_CONTAINER" redis-cli --no-auth-warning -n 7 -x SET blog:monitor >/dev/null 2>&1; then
        return 0
    fi
    echo "$(date '+%F %T') [WARN] 写 Redis 失败 (容器/密码问题?)" >> "$LOG_FILE"
}

# ---- 检查项 ----
reasons=""

# 1. HTTP 探活 (接口内部 COUNT 数据库, 一并验证 DB 链路)
if ! curl -fsS -m 10 "$PROBE_URL" >/dev/null 2>&1; then
    reasons="${reasons}HTTP服务不可达; "
fi

# 2. 可用内存
avail_mb=$(free -m | awk '/^Mem:/{print $7}')
if [ -n "$avail_mb" ] && [ "$avail_mb" -lt "$MEM_THRESHOLD_MB" ]; then
    reasons="${reasons}可用内存仅${avail_mb}MB; "
fi

# 3. 磁盘使用率
disk_used=$(df / | awk 'NR==2{gsub(/%/,"");print $5}')
if [ -n "$disk_used" ] && [ "$disk_used" -ge "$DISK_THRESHOLD" ]; then
    reasons="${reasons}根分区使用${disk_used}%; "
fi

# ---- 状态机: 翻转才推送 ----
prev=$(cat "$STATE_FILE" 2>/dev/null || echo "OK")
ts=$(date +%s)

if [ -n "$reasons" ]; then
    write_redis "{\"ts\":$ts,\"ok\":false,\"reason\":\"${reasons%%; }\"}"
    if [ "$prev" = "OK" ]; then
        echo "$(date '+%F %T') [FAIL] $reasons" >> "$LOG_FILE"
    fi
    echo "FAIL" > "$STATE_FILE"
else
    write_redis "{\"ts\":$ts,\"ok\":true,\"reason\":\"\"}"
    if [ "$prev" = "FAIL" ]; then
        echo "$(date '+%F %T') [RECOVER] 全部恢复正常" >> "$LOG_FILE"
    fi
    echo "OK" > "$STATE_FILE"
fi
