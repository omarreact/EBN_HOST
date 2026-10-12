#!/bin/bash
set -Eeuo pipefail
umask 077
ROOT="/home/akogsfas/ebn-host"
EXPECTED_REMOTE="https://github.com/omarreact/EBN_HOST.git"
STATE="$ROOT/.deploy"
mkdir -p "$STATE/releases" "$STATE/manifests" "$ROOT/tmp"
exec 9>"$STATE/deploy.lock"
flock -n 9 || exit 0
exec >>"$STATE/deploy.log" 2>&1
printf '\n[%s] Check main\n' "$(date -u +%FT%TZ)"
if [[ -f /home/akogsfas/nodevenv/ebn-host/24/bin/activate ]]; then
  # CloudLinux's activation script reads optional unset variables.
  set +u
  source /home/akogsfas/nodevenv/ebn-host/24/bin/activate
  set -u
fi
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) process.exit(1)'
node - "$ROOT" <<'NODE'
const fs = require('fs');
const root = process.argv[2];
for (const pid of fs.readdirSync('/proc').filter(p => /^\d+$/.test(p))) {
  if (Number(pid) === process.pid) continue;
  try {
    const cwd = fs.realpathSync(`/proc/${pid}/cwd`);
    if (cwd !== root && !cwd.startsWith(root + '/.deploy/releases/')) continue;
    const comm = fs.readFileSync(`/proc/${pid}/comm`, 'utf8').trim();
    if (!/node/.test(comm)) continue;
    const command = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ');
    console.log('Scoped app worker:', JSON.stringify({pid:Number(pid),comm,cwd,command}));
  } catch { /* Exited or inaccessible process. */ }
}
NODE
[[ "$(git -C "$ROOT" remote get-url origin)" == "$EXPECTED_REMOTE" ]] || { echo 'Unexpected repository remote'; exit 1; }
git -C "$ROOT" fetch --no-tags origin main
COMMIT="$(git -C "$ROOT" rev-parse FETCH_HEAD)"
[[ "$COMMIT" =~ ^[0-9a-f]{40}$ ]] || exit 1
CURRENT="$(node -e 'const fs=require("fs");try{console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).commit)}catch{console.log("")}' "$STATE/active.json")"
[[ "$COMMIT" != "$CURRENT" ]] || { echo "Already deployed $COMMIT"; exit 0; }
FREE_KB="$(df -Pk "$ROOT" | awk 'NR==2{print $4}')"
[[ "$FREE_KB" -gt 524288 ]] || { echo 'Insufficient free disk space; no files removed'; exit 1; }
STAMP="$(date -u +%Y%m%dT%H%M%S)-$$"
RELEASE_NAME="$COMMIT-$STAMP"
RELEASE="$STATE/releases/$RELEASE_NAME"
mkdir "$RELEASE"
git -C "$ROOT" archive "$COMMIT" | tar -x -C "$RELEASE"
cd "$RELEASE"
if [[ -f package.json ]]; then
  HAS_DEPS="$(node -e 'const p=require("./package.json");console.log(Object.keys({...p.dependencies,...p.devDependencies}).length)')"
  if [[ "$HAS_DEPS" -gt 0 ]]; then
    if [[ -f package-lock.json ]]; then npm ci --include=dev --no-audit --no-fund; else npm install --include=dev --no-audit --no-fund; fi
  fi
  PINFLIX_DEPLOY_TARGET=cpanel npm run build --if-present
fi
PROBE_PORT="$(node -e 'const s=require("net").createServer();s.listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})')"
PORT="$PROBE_PORT" EBN_RELEASE_DIR="$RELEASE" EBN_COMMIT_SHA="$COMMIT" NODE_ENV=production node "$ROOT/bootstrap.cjs" >"$RELEASE/startup-check.log" 2>&1 &
PROBE_PID=$!
trap 'kill "$PROBE_PID" 2>/dev/null || true' EXIT
HEALTH_PATH="$(node -e 'const fs=require("fs");const p="deploy/config.json";console.log(fs.existsSync(p)?JSON.parse(fs.readFileSync(p)).healthPath||"/":"/")')"
[[ "$HEALTH_PATH" == /* && "$HEALTH_PATH" != *$'\n'* ]] || exit 1
READY=0
for ATTEMPT in {1..30}; do
  if ! kill -0 "$PROBE_PID" 2>/dev/null; then break; fi
  if curl --fail --silent --max-time 2 "http://127.0.0.1:$PROBE_PORT$HEALTH_PATH" >"$RELEASE/health-check.json"; then READY=1; break; fi
  sleep 1
done
[[ "$READY" == 1 ]] || { printf '[%s] Startup check failed for %s; active release unchanged\n' "$(date -u +%FT%TZ)" "$COMMIT"; exit 1; }
printf '[%s] Health check passed for %s\n' "$(date -u +%FT%TZ)" "$COMMIT"
kill "$PROBE_PID" 2>/dev/null || true
wait "$PROBE_PID" 2>/dev/null || true
trap - EXIT
node -e 'const fs=require("fs");fs.writeFileSync(process.argv[1],JSON.stringify({commit:process.argv[2],release:process.argv[3],deployedAt:new Date().toISOString()},null,2)+"\n",{flag:"wx"})' "$STATE/manifests/$STAMP.json" "$COMMIT" "$RELEASE_NAME"
if [[ -f "$STATE/active.json" ]]; then cp -p "$STATE/active.json" "$STATE/manifests/previous-$STAMP.json"; fi
# Overwrite only this deployment's pointer; the previous pointer and releases remain.
cp "$STATE/manifests/$STAMP.json" "$STATE/active.json"
touch "$ROOT/tmp/restart.txt"
if [[ -d "/home/akogsfas/ebn-host-runtime/tmp" ]]; then
  touch "/home/akogsfas/ebn-host-runtime/tmp/restart.txt"
fi
if command -v cloudlinux-selector >/dev/null 2>&1; then
  cloudlinux-selector restart --json --interpreter nodejs --app-root ebn-host 2>/dev/null || true
  cloudlinux-selector restart --json --interpreter nodejs --app-root ebn-host-runtime 2>/dev/null || true
else
  echo 'CloudLinux restart command unavailable; Passenger restart file used'
fi
printf '[%s] Activated %s; release=%s\n' "$(date -u +%FT%TZ)" "$COMMIT" "$RELEASE_NAME"
