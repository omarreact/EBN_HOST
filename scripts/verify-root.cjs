"use strict";
// Public smoke test for the root-domain Passenger cutover.
// This validates routing and assets, NOT third-party playback permission or decoding.
const { setTimeout: delay } = require("node:timers/promises");

const origin = new URL(process.env.PINFLIX_TARGET_ORIGIN || process.argv[2] || "https://test.pincodeit.com");
if (!["https:", "http:"].includes(origin.protocol)) throw new Error("Provide an HTTP(S) origin");
const expected = process.env.EXPECTED_COMMIT || "";
const request = async (pathname, label, accept = "text/html") => {
  const url = new URL(pathname, origin);
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: accept },
    signal: AbortSignal.timeout(12000),
  });
  const final = new URL(response.url);
  if (final.origin !== origin.origin) throw new Error(label + ": redirected off target host");
  if (!response.ok) throw new Error(label + ": HTTP " + response.status + " at " + response.url);
  console.log("PASS", label, response.status, final.pathname);
  return response;
};
(async () => {
  const health = await (await request("/_ebn/health", "Passenger health", "application/json")).json();
  if (health.ok !== true || health.service !== "PinFlix") throw new Error("Health is not PinFlix");
  if (expected && health.commit !== expected) throw new Error("Active commit mismatch: " + health.commit);
  if (!health.commit || health.commit === "local") console.warn("WARN health does not show deployed SHA");
  else console.log("Active commit:", health.commit);

  const homeResponse = await request("/", "Homepage");
  const html = await homeResponse.text();
  if (!html.includes("</html>") || !html.toLowerCase().includes("pinflix"))
    throw new Error("Homepage does not look like PinFlix HTML");
  if (html.includes("/ebn-host-live/_next/"))
    throw new Error("Old base path still present in Next.js asset URLs");
  const assets = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)]
    .map((match) => match[1].replace(/&amp;/g, "&"));
  if (!assets.length) throw new Error("No Next.js static assets discovered in HTML");
  await request(assets[0], "Next.js asset", "*/*");

  const catalogue = await request("/api/catalogue/", "Catalogue endpoint", "application/json");
  const catalogueJson = await catalogue.json();
  if (!Array.isArray(catalogueJson.items)) throw new Error("Catalogue endpoint did not return items");
  console.log("Catalogue entries:", catalogueJson.items.length, "stale:", catalogueJson.stale);
  console.log("PASS Root-domain transport smoke test. Media decoding is not covered.");
})().catch((err) => {
  console.error("FAIL Root-domain smoke test:", err.message);
  process.exitCode = 1;
});
