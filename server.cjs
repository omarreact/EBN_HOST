"use strict";
const http = require("node:http");
const next = require("next");
const prefix = "/ebn-host-live";
const app = next({ dev: false, dir: __dirname });
const startedAt = new Date().toISOString();
app
  .prepare()
  .then(() => {
    const handle = app.getRequestHandler();
    const server = http.createServer((req, res) => {
      const pathname = (req.url || "/").split("?")[0];
      if (pathname === "/_ebn/health" || pathname === prefix + "/_ebn/health") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(
          JSON.stringify({
            ok: true,
            service: "PinFlix",
            commit: process.env.EBN_COMMIT_SHA || "local",
            startedAt,
          }),
        );
        return;
      }
      if (pathname !== prefix && !pathname.startsWith(prefix + "/"))
        req.url = prefix + (req.url || "/");
      handle(req, res).catch(() => {
        if (!res.headersSent) res.writeHead(500);
        res.end("Temporarily unavailable");
      });
    });
    server.listen(process.env.PORT || 3000);
    const stop = () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 8000).unref();
    };
    process.on("SIGTERM", stop);
    process.on("SIGINT", stop);
  })
  .catch((error) => {
    console.error("PinFlix startup failed:", error.message);
    process.exit(1);
  });
