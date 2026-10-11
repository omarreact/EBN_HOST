import test from "node:test";
import assert from "node:assert/strict";
import { titleMatch, distance } from "../lib/search";
test("partial and typo tolerant matching uses existing titles", () => {
  assert.equal(titleMatch("Inception", "incepton"), true);
  assert.equal(titleMatch("Earth Abides", "Earth"), true);
  assert.equal(titleMatch("Inception", "Interstellar"), false);
  assert.equal(distance("abc", "abc"), 0);
});
