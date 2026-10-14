import { test } from "node:test";
import assert from "node:assert/strict";
import { TitleSchema } from "../lib/model";
import { defaultPreferences } from "../lib/preferences";
import { mergeLibraries, type LibraryData } from "../lib/library-model";
const title = TitleSchema.parse({
  id: "series-31416",
  providerId: "31416",
  kind: "series",
  title: "Earth Abides",
  poster: null,
  year: 2024,
});
test("library merging deduplicates titles and keeps the newest position per episode", () => {
  const local: LibraryData = {
    list: [title],
    history: [
      {
        title,
        season: 1,
        episode: 1,
        position: 35,
        duration: 100,
        updatedAt: 100,
      },
      {
        title,
        season: 1,
        episode: 2,
        position: 90,
        duration: 100,
        updatedAt: 200,
      },
    ],
    preferences: { ...defaultPreferences, name: "Local viewer" },
  };
  const cloud: LibraryData = {
    list: [title],
    history: [
      {
        title,
        season: 1,
        episode: 1,
        position: 72,
        duration: 100,
        updatedAt: 300,
      },
    ],
    preferences: { ...defaultPreferences, name: "Cloud viewer" },
  };
  const merged = mergeLibraries(local, cloud);
  assert.equal(merged.list.length, 1);
  assert.equal(merged.history.length, 2);
  assert.equal(merged.history[0].episode, 1);
  assert.equal(merged.history[0].position, 72);
  assert.equal(merged.preferences.name, "Local viewer");
  assert.equal(local.history[0].position, 35);
});
