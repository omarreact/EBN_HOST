import { readFile, writeFile } from "node:fs/promises";
import {
  categoriesFromHtml,
  yearsFromHtml,
  titlesFromHtml,
  dedupe,
  detailFromHtml,
} from "../lib/provider/normalize";
async function main() {
  const research = "../provider-research/";
  const home = await readFile(research + "home.html", "utf8");
  const items = dedupe([
    ...titlesFromHtml(home),
    ...titlesFromHtml(await readFile(research + "movies.txt", "utf8"), "movie"),
    ...titlesFromHtml(await readFile(research + "tv.txt", "utf8"), "series"),
  ]);
  const details = [
    detailFromHtml(
      await readFile(research + "movie.txt", "utf8"),
      "movie-77533",
    ),
    detailFromHtml(
      await readFile(research + "series.txt", "utf8"),
      "series-31416",
    ),
  ];
  await writeFile(
    "data/catalogue.json",
    JSON.stringify(
      {
        retrievedAt: new Date().toISOString(),
        items,
        categories: categoriesFromHtml(home),
        years: yearsFromHtml(home),
        details,
      },
      null,
      2,
    ),
  );
  console.log({
    items: items.length,
    categories: categoriesFromHtml(home).length,
    episodes: details[1].episodes.length,
  });
}
void main();
