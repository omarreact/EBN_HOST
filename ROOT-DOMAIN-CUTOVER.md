# Root-domain cutover for PinFlix EBN Host

**Requested URL:** `https://test.pincodeit.com/` (fallback `http://test.pincodeit.com/` only while TLS is being diagnosed).
**Source:** `omarreact/EBN_HOST` at branch `deploy/test-pincodeit-root`.
**Current automatic deployment:** GitHub `main` only, via `/home/akogsfas/ebn-host/deploy/poll-main.sh`.
**Runtime:** `/home/akogsfas/ebn-host-runtime`, Node.js 24 / cPanel Passenger, startup `bootstrap.cjs`.

## Why a server-side cutover is required

Next.js needs a **Passenger application mount at the root URL**, not an upload of the source tree to a public PHP document root. This branch removes the Next.js base path and its request rewrite. **Do not merge this branch into `main` until the cPanel root application URL is configured:** the existing cron would build the root-configured app while the current Passenger mount might still be `/ebn-host-live`, breaking the current endpoint.

## Preflight — read-only

1. In cPanel > Domains, record the domain's exact document root and all existing apps/rewrite rules served under `test.pincodeit.com`. Capture a configuration backup.
2. In cPanel > Setup Node.js App, record all existing application URL mappings and the existing `ebn-host-runtime` settings.
3. Inspect existing PHP/static routes such as `/pinflix-api/`, `/pinflix-cpanel-site/`, `/ebn-host/`, and `/ebn-host-live/` before changing the root. A root Passenger app may **shadow these routes** even if the files remain on disk. Inventory the routes that must remain accessible; implement explicit routing/exclusions or move them to a separate hostname before the root cutover. Do not delete or overwrite these sites.
4. Confirm valid TLS for the test subdomain, available disk, Node 24, and a fresh working rollback release. Do not assume root HTTPS is functional merely because HTTP works.
5. Run `npm ci && npm test && npm run typecheck && npm run lint && npm run build` on the root-configured branch in an isolated workspace.

## Cutover — cPanel authority needed

1. Back up Passenger and vhost rewrite configuration, and snapshot `.deploy/active.json`. Preserve all releases.
2. Change the **dedicated** `ebn-host-runtime` Node.js application URL from `test.pincodeit.com/ebn-host-live` to `test.pincodeit.com/` using cPanel's supported app routing controls. Keep application root `/home/akogsfas/ebn-host-runtime`, startup `bootstrap.cjs`, Node 24, and `EBN_DEPLOY_ROOT=/home/akogsfas/ebn-host` unchanged. Some cPanel configurations disallow root mounting over an existing site; do not force it through destructive .htaccess changes.
3. After root routing is set up and conflicts with existing routes are resolved, merge the reviewed root branch into `main`. The existing cron poller builds and activates the release. The checked-in controller files are not auto-updated on the host; this branch does not require a controller change.
4. Verify `.deploy/deploy.log` and `.deploy/active.json` on EBN. Verify the public health SHA matches the merged `main` commit.
5. Run `npm run verify:root` (optional `PINFLIX_TARGET_ORIGIN=https://test.pincodeit.com EXPECTED_COMMIT=<full-sha> npm run verify:root`) from a network that can reach EBN. Check the homepage, actual static assets, API responses, details/navigation, mobile layout and authorized playback separately. This smoke test does NOT establish video playback authorization.
6. If the site fails, restore the previous Passenger application URL from the backed-up cPanel settings and run the dedicated `deploy/rollback.sh` after checking the target release; keep all logs/evidence. Do not roll back or restart unrelated hosting applications.

## Acceptance

- `https://test.pincodeit.com/` returns the PinFlix homepage with functional Next.js assets.
- `https://test.pincodeit.com/_ebn/health` returns `ok: true` and expected commit SHA.
- `https://test.pincodeit.com/api/catalogue/` returns an application response.
- There are no unintentional `/ebn-host-live` URLs, missing assets, or base-path 404s.
- Other projects on the shared test host remain accessible at their intended URLs.
- No provider playback or HTTPS claim is made without actual network/browser verification.

**Status:** Root-capable application code is staged in a separate branch. EBN/cPanel server-side root mapping and production verification are outstanding.
