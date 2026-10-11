import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Player } from "../components/player";
import { TitleSchema } from "../lib/model";
import { formatTime, clampSeek, mediaError } from "../lib/player";
test("player renders inline video with accessible controls, no iframe", () => {
  const title = TitleSchema.parse({
    id: "movie-1",
    providerId: "1",
    kind: "movie",
    title: "Player component test",
    poster: null,
    year: null,
  });
  const html = renderToStaticMarkup(
    createElement(Player, {
      source: {
        status: "ready",
        message: "",
        checkedAt: "",
        url: "http://cineplexbd.net/test.mp4",
        format: "mp4",
      },
      title,
      onClose: () => {},
      onRetry: () => {},
    }),
  );
  assert.match(html, /<video/);
  for (const label of [
    "Seek video",
    "Back 10 seconds",
    "Forward 10 seconds",
    "Playback speed",
    "Enter fullscreen",
  ])
    assert.ok(html.includes(label));
  assert.ok(!html.includes("<iframe"));
});
test("seek positions clamp and time formatting handles unknown duration", () => {
  assert.equal(clampSeek(-10, 100), 0);
  assert.equal(clampSeek(120, 100), 100);
  assert.equal(formatTime(NaN), "0:00");
  assert.equal(formatTime(3661), "1:01:01");
});
test("error messages distinguish decoder, network and source failures", () => {
  assert.match(mediaError(2), /connection/);
  assert.match(mediaError(3), /decode/);
  assert.match(mediaError(4), /unsupported/);
});
