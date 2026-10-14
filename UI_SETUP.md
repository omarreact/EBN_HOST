# PinFlix UI — run and configure

This deliverable updates the supplied ZIP project. It has not been pushed to a repository or deployed to a live domain.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To check the production version:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

The ZIP contains source, the lockfile, locally bundled fonts/artwork, and documentation. Build outputs, dependencies, local credentials, and QA video fixtures are excluded.

## Environment configuration

Copy `.env.example` to `.env.local` if configuration is needed. Guest discovery, saved titles, progress, and preferences work without account configuration.

| Variable                       | Default | Purpose                                                                                             |
| ------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| `CINEPLEX_PLAYBACK_AUTHORIZED` | `false` | Enables the existing provider's resolver/relay only after permission is established.                |
| `PINFLIX_DOWNLOADS_AUTHORIZED` | `false` | Separate permission for approved direct MP4 downloads. Streaming permission is also required.       |
| `PINFLIX_MATURE_ENABLED`       | `false` | Controls mature catalogue entries on the server.                                                    |
| `FIREBASE_API_KEY`             | unset   | Web API key for the optional Firebase Authentication project; consumed only by server code.         |
| `FIREBASE_PROJECT_ID`          | unset   | Firebase project containing Authentication and the optional Firestore library.                      |
| `PINFLIX_MARVEL_PROMO_URL`     | unset   | Optional approved promotional video for the Marvel panel. Must use a media host allowed by the CSP. |
| `PINFLIX_DC_PROMO_URL`         | unset   | Optional approved promotional video for the DC panel.                                               |
| `PINFLIX_OFFLINE_CATALOGUE`    | `false` | Local QA: use the supplied snapshot without provider requests.                                      |
| `PINFLIX_TEST_MEDIA`           | `false` | Local QA only: existing sample-media mode. Never enable on a public deployment.                     |

No environment secrets or authentication cookies are included in the ZIP. No TMDB API key is required.

## Optional accounts and sync

1. Use the intended PinFlix Firebase project; do not reuse an unrelated project's credentials.
2. Enable email/password Authentication and set the two Firebase variables above.
3. If cloud libraries are needed, enable Firestore and apply the owner-only `pinflixUsers/{uid}` rule from `firestore.rules`. Merge that rule into existing rules; do not overwrite another app's rules.
4. Sign in, then choose **Merge libraries**, **Use account library**, or **Keep this device local**.
5. Cloud changes use a Firestore revision precondition. If another device changed the library, reconnect and merge rather than silently overwriting it.

The server uses Firebase's REST APIs. Passwords and refresh tokens are never put in local storage. Cookies are HTTP-only and use SameSite; account mutations check the request origin. Cloud requests authenticate the user and use that user's Firebase token, so Firestore rules remain authoritative. Account deletion and OAuth are not implemented.

## Vercel

Import the intended repository with Next.js as the framework, the project root as the root directory, and Node.js 24. Use the standard `npm ci` / `npm run build` integration. Configure only the required variables, keep test-media mode disabled, and verify a preview before assigning the intended domain. This task did not select or modify a Vercel project.

The legacy deployment files supplied in the ZIP are retained for compatibility; they are not part of this UI's normal Next.js/Vercel workflow.

## Media and artwork

The supplied Section 3 video URL is preserved exactly. It returned HTTP 403 during this task, so the section can show a poster fallback. An operator must restore access to the supplied asset for its video to play.

The locally bundled artwork corresponds to existing catalogue references, with source URLs recorded in `data/artwork-sources.json`. Artwork rights still belong to their owners. Remaining provider artwork uses a bounded same-origin image relay with an image-only response check. Images that cannot load use a designed fallback.

Marvel/DC affiliations use reviewed IDs in `lib/curation.ts` or explicit `universe` metadata. To extend the collections, add verified catalogue identities. Missing universe movies/series and empty decades are shown honestly; unrelated titles are never substituted.

The current provider relay is preserved, with server-side authorization gates repaired. Large-scale media delivery still needs the project's approved CDN arrangement. Provider availability and hosting/network reachability are separate from completion of the UI.

## Documentation

See `UI_IMPLEMENTATION.md` for the component inventory, data model, verified flows, and remaining integration limits. The supporting policy pages describe this code's practices; the service operator still needs to confirm its legal identity, contact channel, jurisdiction, asset rights, and public deployment practices before release.
