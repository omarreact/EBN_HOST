/** Extract the dominant saturated poster hue and clamp its HSL lightness. */
export type Rgb = readonly [number, number, number];

function toHsl([red, green, blue]: Rgb): [number, number, number] {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min, l = (max + min) / 2;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d) % 6; break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  return [((h * 60) + 360) % 360, s, l];
}

export function clampVibrantRgb(rgb: Rgb): Rgb {
  const [h, s, l] = toHsl(rgb);
  const light = Math.max(0.25, Math.min(0.55, l));
  const chroma = (1 - Math.abs(2 * light - 1)) * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = light - chroma / 2;
  const sectors: Rgb[] = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ];
  const value = sectors[Math.min(5, Math.floor(h / 60))];
  return value.map((c) => Math.max(0, Math.round((c + m) * 255))) as unknown as Rgb;
}

export function dominantPosterRgb(pixels: Uint8ClampedArray): Rgb | null {
  const bins = Array.from({ length: 18 }, () => ({ count: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const rgb: Rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const [h, saturation, lightness] = toHsl(rgb);
    // Ignore monochrome titles and clipped highlights/shadows.
    if (saturation < 0.25 || lightness < 0.08 || lightness > 0.92) continue;
    const bin = bins[Math.floor(h / 20) % bins.length];
    const weight = saturation * Math.min(1, lightness * 3);
    bin.count += weight;
    bin.r += rgb[0] * weight;
    bin.g += rgb[1] * weight;
    bin.b += rgb[2] * weight;
  }
  const top = bins.reduce((best, bin) => bin.count > best.count ? bin : best);
  if (!top.count) return null;
  return coolAmbientRgb([top.r / top.count, top.g / top.count, top.b / top.count]);
}

/**
 * Keeps pixel-dependent ambient lighting but maps it into cool hues.
 * Natural artwork is never modified, only the low-opacity glow.
 * Blue/periwinkle hues (205°..265°) prevent aggressive red/pink wash.
 */
export function coolAmbientRgb(rgb: Rgb): Rgb {
  const [sourceHue, sourceSaturation, sourceLightness] = toHsl(rgb);
  const hue = 205 + (sourceHue / 360) * 60;
  const saturation = Math.max(0.28, Math.min(0.55, sourceSaturation));
  const lightness = Math.max(0.28, Math.min(0.5, sourceLightness));
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - chroma / 2;
  let channels: Rgb;
  if (hue < 240) channels = [0, x, chroma];
  else channels = [x, 0, chroma];
  return channels.map((value) => Math.max(0, Math.round((value + m) * 255))) as unknown as Rgb;
}

export function posterFallbackRgb(src: string | null): Rgb {
  if (!src) return [75, 100, 155];
  const accents: Rgb[] = [    [75, 100, 155], [91, 89, 166], [51, 109, 144],
    [73, 118, 164], [91, 102, 170], [49, 123, 150],
  ];
  let hash = 0;
  for (const char of src) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return accents[hash % accents.length];
}

export const cssRgb = ([r, g, b]: Rgb) => 
  [r, g, b].map((n) => Math.round(n)).join(", ");
