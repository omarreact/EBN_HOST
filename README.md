# PinFlix — EBN Host Edition

A Next.js App Router application for CineplexBD catalogue discovery, native search, movie details, TV seasons/episodes, saved titles and device-local watching progress.

Production target: http://test.pincodeit.com/ebn-host-live/
Source: https://github.com/omarreact/EBN_HOST

## Run locally

Use Node.js 24 and npm. Run `npm ci`, `npm run dev`, then open http://localhost:3000/ebn-host-live/. Production: `npm run build` followed by `npm start`.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`. Integration checks require provider connectivity. Tests use genuine provider record fixtures and explicit parser/security fixtures; fixture streams are never published as catalogue items.

## Content status

Catalogue access and native search are verified. Provider playback permission is not established. `CINEPLEX_PLAYBACK_AUTHORIZED=false` is the default. Consequently the public application honestly reports unavailable playback rather than publishing unapproved media URLs. Enabling the flag alone does not establish permission or prove playback: confirm the permitted integration first, then test the resolver and actual browser playback on the deployed host.

MP4 Range and HLS playlist transport responses were observed locally; the advertised same-host TV HLS route returned 403. Sustained full-length playback is not verified. See PROVIDER-RESEARCH.md.

Mature entries are disabled unless `PINFLIX_MATURE_ENABLED=true`; the self-attestation detail gate is not legal identity verification. Provider and host policies must be confirmed before enabling mature content.

## Application structure

- `app/`: responsive pages and bounded provider API routes.
- `lib/provider/`: allowlisted fetches, caches, normalization, discovery, source capability resolution.
- `components/player.tsx`: lazy-loaded native MP4/HLS player with overlay controls, quality/audio/caption controls when supplied by HLS, recovery and progress.
- `data/catalogue.json`: dated metadata snapshot of genuine retrieved records, used only as a disclosed fallback. This is not a video asset mirror or a claim of full catalogue coverage.
- `lib/storage.ts`: schema-validated, versioned browser storage for list and progress; no accounts or secrets.

## EBN deployment

The existing `bootstrap.cjs`, `deploy/poll-main.sh`, retained release directories and activation contract are preserved. `server.cjs` now starts Next.js and accepts Passenger's PORT. It restores the mount prefix only when the incoming URL lacks it. Build-time basePath is `/ebn-host-live`, with trailing slashes, and assets use that prefix. A regular production build is used: standalone tracing does not include custom startup servers.

The existing main-branch cron installs dependencies, builds, probes `/_ebn/health`, and activates successful releases. No separate deployment system is installed. Builds use one worker and a 1536 MB parent heap limit. Shared-host limits still need production verification. Runtime settings in cPanel and build-time cron settings are separate; never commit secrets.

Keep databases/uploads outside immutable releases. Existing root PHP diagnostics and other projects are preserved. Earlier releases remain and consume disk/inodes. No cleanup or database migration runs automatically.

See DEPLOYMENT.md for controller details and PROVIDER-RESEARCH.md for verified endpoints and limitations.
