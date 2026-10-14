"use client";
import { useEffect, useState } from "react";
import { artworkUrl } from "./artwork";
import { cssRgb, dominantPosterRgb, posterFallbackRgb } from "@/lib/poster-color";

const colors = new Map<string, string>();

/**
 * Samples same-origin (or CORS-enabled) posters with a tiny offscreen canvas.
 * On tainted/unavailable artwork, fall back to a stable cinematic hue.
 * Reset the page-wide ambient token on route unmount.
 */
export function usePosterAmbient(src: string | null): string {
  const url = artworkUrl(src);
  const [rgb, setRgb] = useState(() => cssRgb(posterFallbackRgb(src)));

  useEffect(() => {
    const root = document.documentElement;
    if (!url) {
      root.removeAttribute("data-poster-ambient");
      root.style.removeProperty("--poster-rgb");
      return;
    }
    let cancelled = false;
    const initial = colors.get(url) || cssRgb(posterFallbackRgb(src));
    setRgb(initial);
    root.dataset.posterAmbient = "true";
    root.style.setProperty("--poster-rgb", initial);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, 32, 32);
        const sampled = dominantPosterRgb(ctx.getImageData(0, 0, 32, 32).data);
        if (!sampled || cancelled) return;
        const value = cssRgb(sampled);
        colors.set(url, value);
        setRgb(value);
        root.style.setProperty("--poster-rgb", value);
      } catch {
        // Cross-origin images without CORS headers cannot be sampled.
      }
    };
    if (!colors.has(url)) {
      image.src = url;
    }
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      root.removeAttribute("data-poster-ambient");
      root.style.removeProperty("--poster-rgb");
    };
  }, [url, src]);

  return rgb;
}
