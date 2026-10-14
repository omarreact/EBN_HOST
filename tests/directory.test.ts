import { test } from "node:test";
import assert from "node:assert/strict";
import { TitleSchema } from "../lib/model";
import { filterTitles, titleLetter } from "../lib/directory";
import { universeFor } from "../lib/curation";
import { QuerySchema } from "../lib/catalogue-query";
const movie = (id: string, title: string, year: number | null, other = {}) =>
  TitleSchema.parse({
    id: `movie-${id}`,
    providerId: id,
    kind: "movie",
    title,
    year,
    poster: null,
    ...other,
  });
test("combined filters apply across the index before pagination", () => {
  const items = Array.from({ length: 80 }, (_, i) =>
    movie(
      String(i + 1),
      `Story ${String(i).padStart(2, "0")}`,
      i % 2 ? 2024 : 2020,
      { language: i % 3 ? "English" : "Bangla", quality: "1080P" },
    ),
  );
  const selected = filterTitles(items, {
    year: 2024,
    language: "English",
    quality: "1080p",
    sort: "title-desc",
  });
  assert.equal(selected.length, 27);
  assert.equal(selected[0].title, "Story 79");
  assert.ok(selected.every((t) => t.year === 2024 && t.language === "English"));
});
test("numeric and accented names have consistent alphabetical groups", () => {
  assert.equal(titleLetter("  303 Squadron"), "#");
  assert.equal(titleLetter("Çatlı"), "C");
  assert.equal(titleLetter("Earth Abides"), "E");
});
test("aliases and year bounds combine without inventing missing years", () => {
  const items = [
    movie("1", "Original Name", 2009, { aliases: ["Alternate Name"] }),
    movie("2", "Alternate Name", null),
    movie("3", "Alternate Name", 2024),
  ];
  assert.deepEqual(
    filterTitles(items, {
      q: "Alternate Name",
      yearFrom: 2000,
      yearTo: 2019,
    }).map((t) => t.id),
    ["movie-1"],
  );
});
test("universe collections use reviewed identities", () => {
  assert.equal(universeFor(movie("34110", "The Dark Knight", 2008)), "dc");
  assert.equal(
    universeFor(movie("11", "Flash Flood", 2024, { genres: ["Action"] })),
    null,
  );
  assert.equal(
    filterTitles([movie("11", "Flash Flood", 2024)], { universe: "dc" }).length,
    0,
  );
});
test("URL filters normalize invalid pages and unsupported sorting", () => {
  const q = QuerySchema.parse({
    page: "-1",
    sort: "unsafe",
    letter: "ZZ",
    year: "text",
  });
  assert.equal(q.page, 1);
  assert.equal(q.sort, "title");
  assert.equal(q.letter, "");
  assert.equal(q.year, "");
});
