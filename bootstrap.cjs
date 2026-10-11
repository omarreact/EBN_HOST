'use strict';
// Stable Passenger startup file. Releases and manifests live outside the document root.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
let release = root;
let manifest;
if (process.env.EBN_RELEASE_DIR) {
  release = path.resolve(process.env.EBN_RELEASE_DIR);
} else {
  const active = path.join(root, '.deploy', 'active.json');
  if (fs.existsSync(active)) {
    manifest = JSON.parse(fs.readFileSync(active, 'utf8'));
    release = path.resolve(root, '.deploy', 'releases', manifest.release);
    const allowed = path.join(root, '.deploy', 'releases') + path.sep;
    if (!release.startsWith(allowed)) throw new Error('Invalid release location');
    process.env.EBN_COMMIT_SHA = manifest.commit;
  }
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
  process.exitCode = 1;
});
