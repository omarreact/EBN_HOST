# PinFlix — a world of stories

A cinematic Next.js movie and TV catalogue with seven homepage sections, fast text-first directories, unified search, personal watchlists, and a persistent in-page player.

The UI uses a Obsidian Frost charcoal design system with cool periwinkle and teal accents, locally bundled Inter fonts, responsive discovery rails, and desktop/tablet/mobile layouts. It preserves the supplied provider integration and never presents unavailable streams as playable.

## Start

Requires **Node.js 24** and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Guest watchlists and progress work on this device without account configuration.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Included

- Cinematic homepage: featured carousel, latest movies, supplied promotional video with fallback, latest series, Marvel/DC collections, decade browsing, rediscovery picks.
- `/movies` and `/series`: text-only lists with URL-preserved search/filter/sort state and server-side pagination.
- Movie and series detail pages: source-gated in-page playback, season/episode selection, resume progress, and related titles.
- Shared player: MP4/HLS, actual stream track menus, seek/speed/volume controls, fullscreen, theater mode, persistent mini-player, and supported picture-in-picture.
- `/my-list`: Watch Later and Continue Watching, with local persistence and removal controls.
- `/login` and `/profile`: guest preferences and optional Firebase email/password accounts with explicit library-merge choices.
- About, services, privacy, and terms pages.

## Integration status

Provider playback and downloads are disabled unless their respective approval settings are supplied. The optional Firebase account/sync service needs project configuration. The supplied promotional-video URL returned HTTP 403 during verification; its poster fallback is implemented.

Player controls were browser-tested with a generated local MP4 fixture. Live provider playback, configured Firebase accounts, and an actual production domain were not verified. No deployment was performed by this ZIP-edit task.

See **[UI_SETUP.md](UI_SETUP.md)** for configuration and deployment steps and **[UI_IMPLEMENTATION.md](UI_IMPLEMENTATION.md)** for the implementation and verification report.

## Source structure

- `app/` — App Router pages and API routes.
- `components/` — reusable discovery, account, library, and playback components.
- `lib/` — schemas, catalogue filters, preferences, storage, account adapter, provider normalization.
- `data/` — supplied catalogue snapshot and artwork references.
- `public/` — bundled artwork and licensed Inter font files.
- `tests/` — player, provider, directory, search, and library-merge tests.

The original legacy deployment files remain for compatibility. Normal operation uses standard Next.js scripts. Do not place source under a publicly served document root.
