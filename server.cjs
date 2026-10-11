'use strict';
const http = require('node:http');
const startedAt = new Date().toISOString();
http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const result = { service: 'EBN_HOST', ok: true, branch: 'main', commit: process.env.EBN_COMMIT_SHA || 'bootstrap', nodeVersion: process.version, startedAt, checkedAt: new Date().toISOString() };
  if ((req.url || '').split('?')[0].endsWith('/_ebn/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result, null, 2));
    return;
  }
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'");
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>EBN_HOST deployment</title><style>body{font:18px system-ui;background:#101827;color:#eef2ff;margin:0;padding:8vw}main{max-width:760px}code{overflow-wrap:anywhere;color:#a5f3fc}p{line-height:1.6}.status{color:#86efac}</style><main><p class="status">Node.js is running</p><h1>EBN_HOST</h1><p>This starter page verifies the GitHub-to-EBN deployment connection. Commit your application to the repository's main branch to replace it.</p><p>Branch: <code>main</code><br>Commit: <code>${result.commit}</code><br>Node.js: <code>${process.version}</code></p><p>Previous releases are retained. No automatic file cleanup is enabled.</p></main></html>`);
}).listen(process.env.PORT || 3000);
