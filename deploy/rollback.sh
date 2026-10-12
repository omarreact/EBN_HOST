#!/bin/bash
set -Eeuo pipefail
umask 077

ROOT="${EBN_DEPLOY_ROOT:-/home/akogsfas/ebn-host}"
STATE="$ROOT/.deploy"

if [[ ! -d "$STATE" || ! -f "$STATE/active.json" ]]; then
  echo "Deployment state not found in $STATE"
  exit 1
fi

exec 9>"$STATE/deploy.lock"
flock -n 9 || { echo "Deployment or rollback in progress; lock busy"; exit 1; }
exec >>"$STATE/deploy.log" 2>&1

printf '\n[%s] Rollback requested\n' "$(date -u +%FT%TZ)"

CURRENT_COMMIT="$(node -e 'const fs=require("fs");try{console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).commit)}catch{console.log("")}' "$STATE/active.json")"
CURRENT_RELEASE="$(node -e 'const fs=require("fs");try{console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).release)}catch{console.log("")}' "$STATE/active.json")"

TARGET_COMMIT="${1:-}"

if [[ -z "$TARGET_COMMIT" ]]; then
  # Look for the most recent previous manifest or backup
  TARGET_MANIFEST="$(node - "$STATE" <<'NODE'
const fs = require('fs');
const path = require('path');
const state = process.argv[2];
const manifestsDir = path.join(state, 'manifests');
if (!fs.existsSync(manifestsDir)) process.exit(0);
const active = JSON.parse(fs.readFileSync(path.join(state, 'active.json'), 'utf8'));
const files = fs.readdirSync(manifestsDir)
  .filter(f => f.endsWith('.json') && !f.startsWith('rollback-from-'))
  .sort()
  .reverse();
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(manifestsDir, file), 'utf8'));
    if (data.commit && data.commit !== active.commit && data.release) {
      console.log(path.join(manifestsDir, file));
      break;
    }
  } catch {}
}
NODE
)"
  if [[ -z "$TARGET_MANIFEST" || ! -f "$TARGET_MANIFEST" ]]; then
    echo "No valid previous release manifest found to roll back to"
    exit 1
  fi
  TARGET_COMMIT="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).commit)' "$TARGET_MANIFEST")"
  TARGET_RELEASE="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).release)' "$TARGET_MANIFEST")"
else
  # Find manifest matching the requested commit
  TARGET_RELEASE="$(node - "$STATE" "$TARGET_COMMIT" <<'NODE'
const fs = require('fs');
const path = require('path');
const state = process.argv[2];
const commit = process.argv[3];
const manifestsDir = path.join(state, 'manifests');
const releasesDir = path.join(state, 'releases');
let found = null;
if (fs.existsSync(manifestsDir)) {
  for (const file of fs.readdirSync(manifestsDir).filter(f => f.endsWith('.json'))) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(manifestsDir, file), 'utf8'));
      if (d.commit === commit && d.release) { found = d.release; break; }
    } catch {}
  }
}
if (!found && fs.existsSync(releasesDir)) {
  for (const r of fs.readdirSync(releasesDir)) {
    if (r.startsWith(commit + '-')) { found = r; break; }
  }
}
if (found) console.log(found);
NODE
)"
  if [[ -z "$TARGET_RELEASE" ]]; then
    echo "Target commit $TARGET_COMMIT has no recorded release in $STATE"
    exit 1
  fi
fi

RELEASE_DIR="$STATE/releases/$TARGET_RELEASE"
if [[ ! -d "$RELEASE_DIR" ]]; then
  echo "Target release directory does not exist: $RELEASE_DIR"
  exit 1
fi

echo "Verifying rollback target: commit=$TARGET_COMMIT release=$TARGET_RELEASE"

# Probe target release health before activating
PROBE_PORT="$(node -e 'const s=require("net").createServer();s.listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})')"
PORT="$PROBE_PORT" EBN_RELEASE_DIR="$RELEASE_DIR" EBN_COMMIT_SHA="$TARGET_COMMIT" NODE_ENV=production node "$ROOT/bootstrap.cjs" >"$RELEASE_DIR/rollback-check.log" 2>&1 &
PROBE_PID=$!
trap 'kill "$PROBE_PID" 2>/dev/null || true' EXIT

CONFIG_PATH="$RELEASE_DIR/deploy/config.json"
HEALTH_PATH="$(node -e 'const fs=require("fs");const p=process.argv[1];console.log(fs.existsSync(p)?JSON.parse(fs.readFileSync(p)).healthPath||"/":"/")' "$CONFIG_PATH")"

READY=0
for ATTEMPT in {1..20}; do
  if ! kill -0 "$PROBE_PID" 2>/dev/null; then break; fi
  if curl --fail --silent --max-time 2 "http://127.0.0.1:$PROBE_PORT$HEALTH_PATH" >/dev/null; then READY=1; break; fi
  sleep 1
done

kill "$PROBE_PID" 2>/dev/null || true
wait "$PROBE_PID" 2>/dev/null || true
trap - EXIT

if [[ "$READY" != 1 ]]; then
  echo "Target release failed health check; rollback aborted. Current active release remains unchanged."
  exit 1
fi

STAMP="$(date -u +%Y%m%dT%H%M%S)-$$"
# Archive current active pointer before swapping
cp -p "$STATE/active.json" "$STATE/manifests/rollback-from-$CURRENT_COMMIT-$STAMP.json"

node -e 'const fs=require("fs");fs.writeFileSync(process.argv[1],JSON.stringify({commit:process.argv[2],release:process.argv[3],rolledBackAt:new Date().toISOString(),rolledBackFrom:process.argv[4]},null,2)+"\n")' "$STATE/active.json" "$TARGET_COMMIT" "$TARGET_RELEASE" "$CURRENT_COMMIT"

touch "$ROOT/tmp/restart.txt"
if [[ -d "/home/akogsfas/ebn-host-runtime/tmp" ]]; then
  touch "/home/akogsfas/ebn-host-runtime/tmp/restart.txt"
fi

if command -v cloudlinux-selector >/dev/null 2>&1; then
  cloudlinux-selector restart --json --interpreter nodejs --app-root ebn-host 2>/dev/null || true
  cloudlinux-selector restart --json --interpreter nodejs --app-root ebn-host-runtime 2>/dev/null || true
fi

printf '[%s] Successfully rolled back to %s (release=%s)\n' "$(date -u +%FT%TZ)" "$TARGET_COMMIT" "$TARGET_RELEASE"
echo "Rollback to $TARGET_COMMIT complete. Current active release updated safely without deleting previous releases."
