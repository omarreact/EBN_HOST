import assert from "node:assert/strict";
import test from "node:test";
import { clampVibrantRgb, cssRgb, dominantPosterRgb, posterFallbackRgb } from "../lib/poster-color";

test("lightness is clamped for dark and bright posters", () => {
  assert.deepEqual(clampVibrantRgb([10, 0, 0]), [128, 0, 0]);
  assert.deepEqual(clampVibrantRgb([255, 220, 220]), [255, 26, 26]);
});

test("poster sampler chooses the dominant vibrant hue over grayscale", () => {
  const pixels = new Uint8ClampedArray([
    200, 20, 30, 255, 220, 15, 30, 255,
    45, 45, 45, 255, 0, 0, 0, 255,
  ]);
  const dominant = dominantPosterRgb(pixels);
  assert.ok(dominant && dominant[0] > dominant[1] * 2);
  assert.equal(dominantPosterRgb(new Uint8ClampedArray([30, 30, 30, 255])), null);
});

test("fallback is stable and CSS-ready", () => {
  assert.deepEqual(posterFallbackRgb(null), [229, 9, 20]);
  assert.equal(cssRgb(posterFallbackRgb("/artwork/example.jpg")), cssRgb(posterFallbackRgb("/artwork/example.jpg")));
});
