# PinFlix poster ambient lighting

PinFlix uses a **two-tier color pipeline**.

1. At build time \`npm run colors:generate\` downsamples local, reviewed images in \`public/artwork\` with **sharp** and writes \`data/poster-colors.json\`. \`npm run build\` runs it automatically through \`prebuild\`; \`npm run dev\` refreshes it through \`predev\`. No network calls are made.
2. At runtime \`usePosterColor(source)\` resolves the poster through the existing \`data/artwork.json\` mapping, immediately selects the precomputed color if available, and otherwise falls back to a stable hue. Only unknown images are sampled on a 32×32 browser canvas. Concurrent requests for the same image are deduplicated and results are held in a bounded memory cache.

The extracted RGB is HSL-lightness-clamped between 25–55% using \`lib/poster-color.ts\`. The hero and title detail pages use \`usePosterAmbient\` for the top-of-page backdrop. The featured video slider uses \`usePosterColor\` for a separate subtle video-only ambient layer, retaining its pitch-black metadata panel. All ambient color changes use a 600ms transition and obey reduced-motion preferences.

### Important limitations

- CORS is **not bypassed**: unknown external images without permission cannot be read through \`canvas\`. Known CineplexBD artwork is mapped to local files when available; other allowed CineplexBD images use the existing same-origin \`/api/artwork/\` route.
- The generator processes local artwork only; there is no remote image fetch or SSRF surface. It is safe to rerun after your authorized catalog/artwork ingestion workflow.
- Adding new local artwork requires regenerating colors. Newly discovered remote posters still render via the browser fallback until ingested. The registry does not use Firebase, because this repository currently uses the static artwork manifest rather than Firebase as its authoritative catalog storage.
- \`data/poster-colors.json\` is checked in as a valid empty initial registry, then regenerated during normal dev/build execution. To retain generated colors in Git history, run \`npm run colors:generate\` and commit the resulting JSON file in the development environment.
