# PinFlix — standard Vercel deployment

This repository is a **normal Next.js App Router application**. It does not need the
cPanel Passenger bootstraps, EBN cron controller, uploads to `public_html`, or a
precompiled cPanel ZIP to deploy on Vercel.

## Import and build

1. Import `omarreact/EBN_HOST` into a **new, dedicated Vercel project**.
   Do not attach this repository to a different PinFlix, IPTV, or LandBD project.
2. Framework Preset: **Next.js**. Repository root: **`./`**.
3. Production Branch: **`main`**. Node.js: **24.x** (from `package.json`).
4. Leave Build Command, Output Directory and Install Command at their
   framework defaults: `next build`, managed Next.js output, npm with lockfile.
   Never select `public_html`, `.next` as a static-only output folder, or
   `server.cjs`/`bootstrap.cjs` as an entrypoint.
5. Deploy first to a Vercel preview URL; verify it before attaching a custom domain.
   **No custom domain is assigned by this code change.**

## Environment variables

In the Vercel project settings, configure only what is required:
- `CINEPLEX_PLAYBACK_AUTHORIZED=false` (default). Do not enable without
  permission and a working end-to-end playback test.
- `PINFLIX_MATURE_ENABLED=false` (default).

Do **not** set `PINFLIX_TEST_MEDIA=true` on production or expose provider
cookies/credentials. No TMDB key is needed.

## Checks

Run locally or in CI:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Against an actual preview deployment:

```sh
PINFLIX_TARGET_ORIGIN=https://YOUR-PREVIEW.vercel.app npm run verify:vercel
```

If the Git commit is known, also set `EXPECTED_COMMIT` to the complete SHA.
`/api/health/` validates the deployed Next.js function, not the availability
of CineplexBD or a media stream.

## Hosting-specific caveats

- Catalogues and search depend on live CineplexBD responses; a dated static
  snapshot may appear when the provider cannot be reached from Vercel.
- Media authorization remains off by default. The web app is **not** a licensed
  streaming service merely because its user interface has a player.
- The existing same-origin media transport/download API can keep a Vercel Function
  busy for a long time, incur cost, or time out. Use only authorized sources,
  enforce access controls, and prefer permitted direct playback or a dedicated
  media CDN rather than Vercel Functions for sustained video delivery.
- The current CSP references legacy HTTP provider media. An HTTPS preview must be
  browser-tested for mixed content, artwork availability and playable formats.
- Any old EBN cron polling GitHub `main` should be disabled by the hosting
  administrator before reusing `main` solely for Vercel deployments; this
  repository does not remotely disable existing cron jobs.
- `server.cjs`, `bootstrap.cjs`, `deploy/`, and EBN documentation remain
  only for legacy cPanel recovery. Vercel uses its own Next.js runtime.
