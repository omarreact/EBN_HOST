import assert from "node:assert/strict";
import { catalogue, suggestions, detail } from "../lib/provider";
async function main() {
  const start = Date.now();
  const c = await catalogue({ kind: "movie" });
  assert.ok(c.categories.length > 20);
  assert.ok(c.items.length > 0);
  const result = await suggestions("Inception");
  assert.ok(result.some((t) => t.title === "Inception" && t.year === 2010));
  const filtered = await catalogue({ q: "Inception", year: 2010 });
  assert.ok(filtered.items.length > 0);
  assert.ok(filtered.items.every((t) => t.year === 2010));
  const series = await detail("series-31416");
  assert.equal(series.title.title, "Earth Abides");
  assert.equal(series.episodes.length, 6);
  assert.ok(series.title.seasons.includes(1));
  const movie = await detail("movie-77533");
  assert.equal(movie.title.title, "Drawn Together");
  assert.ok(movie.title.synopsis.length > 30);
  console.log(
    JSON.stringify(
      {
        status: "Verified",
        categories: c.categories.length,
        movies: c.items.length,
        nativeSearch: result.map((t) => t.id),
        filtered: filtered.items.map((t) => t.id),
        series: series.title.title,
        episodes: series.episodes.length,
        elapsedMs: Date.now() - start,
        stale: c.stale,
      },
      null,
      2,
    ),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
