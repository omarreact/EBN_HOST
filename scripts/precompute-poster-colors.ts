/**
 * Creates a deterministic poster-color registry from bundled, already-approved
 * artwork at build time. No external requests or end-user image processing.
 *
 * Run: npm run colors:generate
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cssRgb, dominantPosterRgb } from "../lib/poster-color";

async function main() {
const root = process.cwd();
const artworkAliases = JSON.parse(
  await readFile(path.join(root, "data", "artwork.json"), "utf8"),
) as Record<string, string>;
const artworkPaths = [...new Set(Object.values(artworkAliases))]
  .filter((name) => /^\/artwork\/[a-f0-9]{16}\.jpg$/i.test(name))
  .sort();

const colors: Record<string, string> = {};
let skipped = 0;
for (const name of artworkPaths) {
  try {
    const fullPath = path.join(root, "public", name.slice(1));
    const { data } = await sharp(fullPath)
      .rotate()
      .resize(32, 32, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const dominant = dominantPosterRgb(new Uint8ClampedArray(data));
    if (dominant) colors[name] = cssRgb(dominant);
    else skipped++;
  } catch {
    skipped++;
  }
}
await writeFile(
  path.join(root, "data", "poster-colors.json"),
  JSON.stringify(colors, null, 2) + "\n",
);
console.info(
  "[PinFlix ambient] precomputed",
  Object.keys(colors).length,
  "poster colors; skipped",
  skipped,
);

}
void main().catch((error: unknown) => {
  console.error("[PinFlix ambient] generation failed", error);
  process.exitCode = 1;
});
