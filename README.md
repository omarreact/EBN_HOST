# PinFlix — Next.js Streaming Catalogue

A Next.js 16 App Router application for movie and TV-series discovery, CineplexBD
catalogue search, season/episode navigation, saved titles, and browser-local
watching progress. The existing player UI supports HLS/MP4 *when a playable,
authorized source is available*.

Source: https://github.com/omarreact/EBN_HOST

## Local development

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000/. Production-compatible local test:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Standard scripts are `next dev`, `next build` and `next start`.
No cPanel Passenger entrypoint or custom build harness is required.

## Vercel deployment

The repository is prepared for Vercel's built-in Next.js integration.
Import **this repository** with Framework Preset **Next.js**, Root Directory
`./`, Production Branch `main`, and Node.js **24.x**. Keep the
framework-default Install, Build and Output settings, and test the preview
URL before assigning any custom domain.

See **[VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md)** for all settings, environmental
requirements, caveats and preview smoke tests (`npm run verify:vercel`).
The Next.js health check is at `/api/health/`.

## Content and playback status

- Metadata discovery and search use CineplexBD's own catalogue.
  If the provider is unavailable, a dated metadata snapshot can be shown.
- Provider playback rights and reliable browser delivery have **not** been
  established. `CINEPLEX_PLAYBACK_AUTHORIZED=false` is the default.
- The server-side media relay is blocked until the playback authorization flag
  is enabled. That flag alone is **not** evidence of permission: only enable it
  for approved provider integrations after security and streaming validation.
- Never enable `PINFLIX_TEST_MEDIA` in production: test media is for
  validating player controls with licensed sample assets.
- `PINFLIX_MATURE_ENABLED=false` is the default. Content and hosting
  restrictions must be assessed before enabling mature categories.
- Vercel Functions are not a substitute for a high-bandwidth streaming CDN.
  Playback through long-running functions can be slow, costly or time out.

## Project structure

- `app/` — Next.js App Router pages, API route handlers and health.
- `components/` — discovery UI, hero/detail pages, HLS/MP4 player.
- `lib/provider/` — bounded provider fetch, normalization and snapshots.
- `lib/storage.ts` — versioned, schema-validated browser storage.
- `data/catalogue.json` — dated fallback metadata, not video hosting.
- `tests/` — unit and provider normalization tests.

## Legacy cPanel / EBN Host

Files `bootstrap.cjs`, `server.cjs`, `scripts/build.cjs`,
`deploy/` and `EBN-PREBUILT-DEPLOY.md` are retained for archival or
separately managed legacy EBN deployments. Vercel does **not** use them.
Do not clone source under a publicly served document root.
If an EBN server is still polling GitHub `main`, disable that cron job on
the hosting account before retiring the old deployment.
