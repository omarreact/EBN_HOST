import assert from "node:assert/strict";
import test from "node:test";
import { clampVibrantRgb, coolAmbientRgb, cssRgb, dominantPosterRgb, posterFallbackRgb } from "../lib/poster-color";

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
  assert.ok(dominant && dominant[2] > dominant[0] && dominant[2] >= dominant[1], "the selected hue should become a cool ambient blue");
  assert.equal(dominantPosterRgb(new Uint8ClampedArray([30, 30, 30, 255])), null);
});

test("fallback is stable and CSS-ready", () => {
  assert.deepEqual(posterFallbackRgb(null), [75, 100, 155]);
  assert.equal(cssRgb(posterFallbackRgb("/artwork/example.jpg")), cssRgb(posterFallbackRgb("/artwork/example.jpg")));
});


test("ambient light is cool-toned even for crimson and orange posters", () => {
  for (const original of [[229, 9, 20], [240, 125, 45], [255, 0, 130], [40, 160, 100]] as const) {
    const [red, green, blue] = coolAmbientRgb(original);
    assert.ok(blue >= red && blue >= green, "blue should dominate ambient hue");
    assert.ok(Math.max(red, green, blue) < 200, "ambient brightness is restrained");
  }
  const sampled = dominantPosterRgb(new Uint8ClampedArray([229, 9, 20, 255]));
  assert.ok(sampled && sampled[2] > sampled[0], "dominant red artwork produces blue ambient light");
});
