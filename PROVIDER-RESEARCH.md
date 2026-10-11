# CineplexBD verification — 12 October 2026

This record separates observations from permissions and playback claims. Public accessibility does not establish an in-app playback agreement. No authentication, DRM, paywall, territorial or provider access control was bypassed. No videos were downloaded or mirrored.

## Verified from the developer's connection

| Endpoint | Observation |
| --- | --- |
| `http://cineplexbd.net/` | HTTP 200 HTML; 65 distinct movie/series category links discovered. Homepage combines movies and series. |
| `/category.php?category=English&page=1` | HTTP 200; paginated movie cards with provider IDs, artwork, category, year and quality labels. Next and Last links exposed. |
| `/tvs.php?page=1` | HTTP 200; series catalogue. |
| `/tcategory.php?category=<source-discovered-name>` | Series category link contract observed in public navigation. Individual category access must be checked when selected. |
| `/search_ajax.php?q=Inception&limit=12` | HTTP 200 JSON `results`; records 40571, 34097, 10644, all Inception (2010), different editions/categories. |
| `/search.php?q=Inception&year[]=2010` | Native HTML search; normalized integration returns those three 2010 records. |
| `/view.php?id=77533` | Drawn Together (2026), synopsis, runtime, genres, cast and poster verified. Provider metadata may be inaccurate; no independent content identity claim. |
| `/player.php?id=77533` | Publishes an expiring signed MP4 URL and an English caption URL. Tokens are never saved in source or reports. |
| `/watch.php?id=31416&season=1` | Earth Abides (2024), season selector and six distinct episode cards. |
| `/watch.php?id=31416&season=1&meta=1` | HTTP 200 JSON; synopsis, rating, cast, episode IDs, still images and origin HLS paths. |
| `/load_more_movies.php?offset=24` | HTTP 200 HTML fragment; pagination adapter uses the provider's page links instead. |

The reference EBN movie page is a static launcher. Its catalogue includes templates using the same sample player ID for multiple entries. These templates were not imported into the new application.

## Media transport observations

- Drawn Together published signed `/v/m/...mp4` route: HTTP **206**, `video/mp4`, `Accept-Ranges: bytes`, `Content-Range: bytes 0-1023/1453141815`, and `Access-Control-Allow-Origin: *`. Headers arrived in approximately 483 ms. The response body was cancelled; no full asset was retrieved.
- Earth Abides S1E1 advertised origin path at `vod.cineplexbd.net:8081/tv-series/.../index.m3u8`: HTTP **206** for a Range request, playlist content type, CORS `*`, 183-byte playlist response. Headers arrived in approximately 226 ms.
- Earth Abides S1E1 page's same-host `/hls/tr/.../master.m3u8`: HTTP **403**. This path remains restricted; it is not rewritten to circumvent its access control.
- MP4 and HLS formats are advertised and transport responses were checked. Decoded, sustained PinFlix playback, adaptive qualities, audio changes, subtitle rendering, seek recovery and mobile fullscreen remain unverified until the integration is authorized and reachable from EBN and the viewing browser.
- No DASH source was found in the inspected records; dash.js is not installed. No additional audio tracks or HLS rendition ladder has been verified.
- HTTP works on this connection. HTTPS availability and provider-network restrictions are unresolved. An HTTP-only origin will fail mixed-content checks if PinFlix is later served through HTTPS without an approved compatible transport.

## Adapter decisions

Primary discovery uses the provider's HTML catalogue and native search. It never calls TMDB search. TMDB image URLs are used only when supplied by CineplexBD. A validated, dated snapshot of 111 genuinely retrieved records and 65 categories provides an explicit degraded state when the provider is unavailable. Live categories and pages refresh through bounded metadata caches. No full provider catalogue coverage is claimed.

Language values derived from category names are labelled collection languages; they are not independently verified original languages. Exact release dates and alternative titles were not reliably exposed by the inspected pages. Spelling tolerance searches previously discovered records only. Actor search uses the published `actors` form field; detailed actor coverage is not verified.

The player is MP4/native HLS/hls.js capable, inside the detail hero. Resolver URLs remain server-side until direct playback permission is established and a fresh transport check succeeds. No large-video relay, arbitrary proxy, Cloudflare resource, R2 upload, or other repository change is included. Mature entries remain disabled by default; enabling them requires provider and host policy confirmation and stronger age controls as applicable.
