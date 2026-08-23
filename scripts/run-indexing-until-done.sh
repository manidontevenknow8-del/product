#!/usr/bin/env bash
# run-indexing-until-done.sh
#
# Daily drip of Google Indexing API URL_UPDATED notifies until every PASS
# publish-wave URL is submitted (~200/day Google quota).
#
# Usage:
#   ./scripts/run-indexing-until-done.sh
#   ./scripts/run-indexing-until-done.sh --once          # single day only
#   INTERVAL_HOURS=24 ./scripts/run-indexing-until-done.sh
#
# Logs: content-data/generated/reports/indexing-until-done.log
# PID:  content-data/generated/reports/indexing-until-done.pid
#
# Exit codes from run-indexing-waves.ts:
#   0  = complete → this script exits 0
#  10  = more remain after today's batch → sleep and continue
#  11  = cooldown / nothing today → sleep and continue
#   1  = error → sleep shorter and retry (does not abort the loop)

set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPORT_DIR="$ROOT/content-data/generated/reports"
mkdir -p "$REPORT_DIR"
LOG="$REPORT_DIR/indexing-until-done.log"
PID_FILE="$REPORT_DIR/indexing-until-done.pid"
INTERVAL_HOURS="${INTERVAL_HOURS:-24}"
INTERVAL_SECS=$((INTERVAL_HOURS * 3600))
COOLDOWN_SECS=$((INTERVAL_HOURS * 3600))
ERROR_RETRY_SECS=$((6 * 3600))
ONCE=0

for arg in "$@"; do
  case "$arg" in
    --once) ONCE=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
  esac
done

echo $$ > "$PID_FILE"

log() {
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  printf '[%s] %s\n' "$ts" "$*" | tee -a "$LOG"
}

cleanup() {
  rm -f "$PID_FILE"
}
trap cleanup EXIT

log "START indexing-until-done · interval=${INTERVAL_HOURS}h · once=$ONCE · cwd=$ROOT"
log "Log: $LOG"

day=0
while true; do
  day=$((day + 1))
  log "=== Day $day: running npm run google:run-indexing-waves ==="

  set +e
  npm run google:run-indexing-waves -- --limit=200 >>"$LOG" 2>&1
  code=$?
  set -e

  log "Day $day finished with exit code $code"

  if [ "$code" -eq 0 ]; then
    log "COMPLETE — all publish-wave URLs submitted via Indexing API."
    echo "AGENT_LOOP_TICK_indexing_daily {\"prompt\":\"Indexing complete. Summarize final .indexing-state.json progress and stop the daily loop.\",\"status\":\"complete\",\"exit\":0}"
    exit 0
  fi

  if [ "$ONCE" -eq 1 ]; then
    log "Stopping after --once (exit $code)."
    exit "$code"
  fi

  sleep_secs=$INTERVAL_SECS
  reason="daily interval"
  if [ "$code" -eq 11 ]; then
    sleep_secs=$COOLDOWN_SECS
    reason="cooldown / wait for next quota window"
  elif [ "$code" -eq 1 ] || [ "$code" -gt 11 ]; then
    sleep_secs=$ERROR_RETRY_SECS
    reason="error retry in ${ERROR_RETRY_SECS}s"
  fi

  next_at="$(date -u -v+"${sleep_secs}S" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "+${sleep_secs} seconds" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "in ${sleep_secs}s")"
  log "Sleeping ${sleep_secs}s ($reason). Next attempt ~ $next_at"
  echo "AGENT_LOOP_TICK_indexing_daily {\"prompt\":\"Daily Indexing API progress update: read content-data/generated/reports/indexing-until-done.log tail and .indexing-state.json; report submitted/total and whether the loop is still running. If complete, stop monitoring.\",\"status\":\"waiting\",\"exit\":$code,\"next\":\"$next_at\"}"

  sleep "$sleep_secs"
done
