"use client";

import { useEffect, useState } from "react";
import manifest from "@/data/poster-colors.json";
import { artworkUrl } from "./artwork";
import { cssRgb, dominantPosterRgb, posterFallbackRgb } from "@/lib/poster-color";

type CachedColor = { url: string | null; rgb: string };
const precomputed = manifest as Record<string, string>;
const memory = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();
const MAX_MEMORY_COLORS = 300;

/** Prefer the build-time cache; use a stable color until uncached artwork loads. */
function colorFor(url: string | null, source: string | null): string {
  if (!url) return cssRgb(posterFallbackRgb(null));
  return precomputed[url] || memory.get(url) || cssRgb(posterFallbackRgb(source));
}

function extractOnCanvas(url: string): Promise<string | null> {
  const current = pending.get(url);
  if (current) return current;

  const task = new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        // 32x32 = at most 1024 pixels; never decode a full poster into canvas.
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 32;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return resolve(null);
        context.drawImage(img, 0, 0, 32, 32);
        const color = dominantPosterRgb(
          context.getImageData(0, 0, 32, 32).data,
        );
        resolve(color ? cssRgb(color) : null);
      } catch {
        // Browser CORS rules still apply even with crossOrigin="anonymous".
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  }).then((result) => {
    if (memory.size >= MAX_MEMORY_COLORS) memory.delete(memory.keys().next().value!);
    memory.set(url, result || "");
    pending.delete(url);
    return result;
  });
  pending.set(url, task);
  return task;
}

/**
 * Returns a cached RGB triplet: "r, g, b".
 * First choice: build-time poster-color registry.
 * Second choice: shared in-memory browser cache.
 * Last resort: downscaled canvas with CORS-safe failure fallback.
 */
export function usePosterColor(src: string | null): string {
  const url = artworkUrl(src);
  const [computed, setComputed] = useState<CachedColor | null>(null);
  const initial = colorFor(url, src);
  useEffect(() => {
    if (!url || precomputed[url] || memory.has(url)) return;
    let mounted = true;
    void extractOnCanvas(url).then((rgb) => {
      if (mounted && rgb) setComputed({ url, rgb });
    });
    return () => { mounted = false; };
  }, [url]);
  return computed?.url === url ? computed.rgb : initial;
}

/**
 * Sets the global hero/detail ambient token. Components such as the spotlight
 * can instead call usePosterColor() to render independently scoped lighting.
 */
export function usePosterAmbient(src: string | null): string {
  const rgb = usePosterColor(src);
  useEffect(() => {
    const root = document.documentElement;
    if (!src) return;
    root.dataset.posterAmbient = "true";
    root.style.setProperty("--poster-rgb", rgb);
    return () => {
      // Do not accidentally clear a newer route's color.
      if (root.style.getPropertyValue("--poster-rgb") === rgb) {
        root.removeAttribute("data-poster-ambient");
        root.style.removeProperty("--poster-rgb");
      }
    };
  }, [rgb, src]);
  return rgb;
}
