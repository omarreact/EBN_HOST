"use strict";
// Transport-only smoke test for the standard Vercel Next.js deployment.
const origin = new URL(process.env.PINFLIX_TARGET_ORIGIN || process.argv[2] || "http://localhost:3000");
if (!["http:", "https:"].includes(origin.protocol)) throw new Error("Provide an HTTP(S) origin");
const expected = process.env.EXPECTED_COMMIT || "";
async function request(pathname, label, accept = "text/html") {
  const url = new URL(pathname, origin);
  const response = await fetch(url, {
    headers: { Accept: accept },
    signal: AbortSignal.timeout(15_000),
  });
  const final = new URL(response.url);
  if (final.origin !== origin.origin) throw new Error(label + ": redirected off target host");
  if (!response.ok) throw new Error(label + ": HTTP " + response.status);
  console.log("PASS", label, response.status, final.pathname);
  return response;
}
(async () => {
  const health = await (await request("/api/health/", "Next.js health", "application/json")).json();
  if (!health.ok || health.service !== "PinFlix") throw new Error("Unexpected health response");
  if (expected && health.commit !== expected) throw new Error("Wrong commit: " + health.commit);
  console.log("Commit:", health.commit || "local/unavailable");

  const homepage = await (await request("/", "Homepage")).text();
  if (!homepage.includes("</html>") || !homepage.toLowerCase().includes("pinflix"))
    throw new Error("PinFlix homepage not rendered");
  if (homepage.includes("/ebn-host-live/_next/")) throw new Error("Old basePath still present");
  const assets = [...homepage.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)]
    .map((m) => m[1].replaceAll("&amp;", "&"));
  if (!assets.length) throw new Error("Missing Next.js assets");
  await request(assets[0], "Static Next.js asset", "*/*");

  const catalogue = await (await request("/api/catalogue/", "Catalogue", "application/json")).json();
  if (!Array.isArray(catalogue.items)) throw new Error("Unexpected catalogue response");
  console.log("Catalogue entries:", catalogue.items.length, "stale:", catalogue.stale);
  console.log("PASS Vercel routing smoke test (not a streaming or provider authorization test)");
})().catch((e) => {
  console.error("FAIL", e.message);
  process.exitCode = 1;
});
