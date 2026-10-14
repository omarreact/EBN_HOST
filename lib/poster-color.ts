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
  return value.map((c) => Math.round((c + m) * 255)) as unknown as Rgb;
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
  return clampVibrantRgb([top.r / top.count, top.g / top.count, top.b / top.count]);
}

export function posterFallbackRgb(src: string | null): Rgb {
  if (!src) return [229, 9, 20];
  const accents: Rgb[] = [
    [229, 9, 20], [215, 31, 103], [91, 68, 187],
    [22, 118, 161], [183, 70, 36], [42, 133, 99],
  ];
  let hash = 0;
  for (const char of src) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return accents[hash % accents.length];
}

export const cssRgb = ([r, g, b]: Rgb) => 
  [r, g, b].map((n) => Math.round(n)).join(", ");
