'use strict';
// Stable Passenger startup file. Releases and manifests live outside the document root.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const activeFile = path.join(root, '.deploy', 'active.json');
let release = root;
let manifest;
if (process.env.EBN_RELEASE_DIR) {
  release = path.resolve(process.env.EBN_RELEASE_DIR);
} else {
  const active = activeFile;
  if (fs.existsSync(active)) {
    manifest = JSON.parse(fs.readFileSync(active, 'utf8'));
    release = path.resolve(root, '.deploy', 'releases', manifest.release);
    const allowed = path.join(root, '.deploy', 'releases') + path.sep;
    if (!release.startsWith(allowed)) throw new Error('Invalid release location');
    process.env.EBN_COMMIT_SHA = manifest.commit;
  }
}
// LiteSpeed may not notice Passenger restart.txt on this shared host.
// Exit only this dedicated app after a validated release changes; the host respawns it.
if (!process.env.EBN_RELEASE_DIR) {
  const startedCommit = manifest?.commit || null;
  setInterval(() => {
    try {
      const next = JSON.parse(fs.readFileSync(activeFile, 'utf8'));
      if (next.commit && next.commit !== startedCommit) {
        console.log('A validated deployment is ready; restarting the dedicated app.');
        process.exit(0);
      }
    } catch { /* A missing or briefly incomplete pointer must not stop the app. */ }
  }, 2000).unref();
}
process.chdir(release);
const configPath = path.join(release, 'deploy', 'config.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
const startup = config.startup || (fs.existsSync(path.join(release, 'server.cjs')) ? 'server.cjs' : fs.existsSync(path.join(release, 'app.js')) ? 'app.js' : null);
if (!startup || path.isAbsolute(startup) || startup.split(/[\\/]/).includes('..')) throw new Error('Set a relative startup file in deploy/config.json');
const entry = path.resolve(release, startup);
if (!entry.startsWith(release + path.sep) || entry === __filename) throw new Error('Invalid startup file');
// Dynamic import supports both CommonJS and ESM application startup files.
import(require('node:url').pathToFileURL(entry).href).catch(error => {
  console.error('Application startup failed:', error.message);
  process.exit(1);
});
