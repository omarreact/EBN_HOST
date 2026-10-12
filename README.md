# PinFlix — EBN Host Edition

A Next.js App Router application for CineplexBD catalogue discovery, native search, movie details, TV seasons/episodes, saved titles and device-local watching progress.

Root-domain deployment candidate: http://abc.pincodeit.com/ (requires separate cPanel Passenger application-URL cutover; not yet verified live).
Source: https://github.com/omarreact/EBN_HOST

## Run locally

Use Node.js 24 and npm. Run `npm ci`, `npm run dev`, then open http://localhost:3000/. Production: `npm run build` followed by `npm start`.

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

## Prebuilt cPanel deployment (recommended for the current host)

CloudLinux's 4 GiB process-address-space limit caused the on-host Next.js build to fail with a V8 out-of-memory error. The GitHub Actions workflow now packages a **precompiled Node.js 24 production runtime** after the existing build/test checks pass. Download the `pinflix-ebn-prebuilt-node24` artifact from a successful Actions run, upload/extract it to the **private** `pinflix-ebn-app` folder, install runtime dependencies if needed, and restart cPanel's Node.js app. **Do not rebuild on EBN.** See [EBN-PREBUILT-DEPLOY.md](EBN-PREBUILT-DEPLOY.md) for exact installation, verification, and rollback steps.

## EBN deployment

The existing `bootstrap.cjs`, `deploy/poll-main.sh`, retained release directories and activation contract are preserved. `server.cjs` now starts Next.js and accepts Passenger's PORT. This branch serves Next.js directly at `/` and has no build-time `basePath`. The EBN Passenger application URL must also be switched to the domain root before merging this branch to `main`. A regular production build is used: standalone tracing does not include custom startup servers.

The existing main-branch cron installs dependencies, builds, probes `/_ebn/health`, and activates successful releases. No separate deployment system is installed. Builds use one worker and a 1536 MB parent heap limit. Shared-host limits still need production verification. Runtime settings in cPanel and build-time cron settings are separate; never commit secrets.

Keep databases/uploads outside immutable releases. Existing root PHP diagnostics and other projects must be inventoried before cutover because the root Passenger mount can shadow their URLs; do not delete or overwrite them. Earlier releases remain and consume disk/inodes. No cleanup or database migration runs automatically.

See DEPLOYMENT.md for controller details and PROVIDER-RESEARCH.md for verified endpoints and limitations.

For the root-domain migration checklist and verification criteria, see [ROOT-DOMAIN-CUTOVER.md](ROOT-DOMAIN-CUTOVER.md).
