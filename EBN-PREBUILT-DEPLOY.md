# Deploy prebuilt PinFlix to EBN Host (no build on cPanel)

This process uses GitHub Actions to compile **Next.js 16.4.0 with Node.js 24**.
The CloudLinux/Passenger server only installs runtime dependencies and starts the
already-compiled application. It avoids the shared-host `npm run build` crash
(`JavaScript heap out of memory` / `SIGABRT`).

## 1. Download the matching prebuilt runtime

1. Open **GitHub > omarreact/EBN_HOST > Actions > Verify EBN Host application**.
2. Select a **successful main-branch run** for the commit you want to deploy.
   Wait for all checks, the production compilation and artifact upload to pass.
3. Under **Artifacts**, download `pinflix-ebn-prebuilt-node24`.
   GitHub downloads it as a ZIP containing the **contents of the application root**:
   `.next/` (including dotfiles), `package.json`, `package-lock.json`,
   `server.cjs`, `next.config.mjs`, the source directories needed for the
   application, and `EBN_BUILD_SHA`.
4. Keep the exact build ZIP together with its Actions run/commit SHA.
   The ZIP does not contain `node_modules`, `.env`, `.git` or `.next/cache`.
   Artifacts expire after **14 days**.

Do not download a different ZIP with only the GitHub source and attempt to compile
it on EBN: that reproduces the shared-host memory failure.

## 2. Back up and extract safely in cPanel

The currently configured Node.js application is:

- Domain: `http://abc.pincodeit.com/` (HTTP testing only)
- Application root: `/home/akogsfas/pinflix-ebn-app`
- Startup file: `server.cjs`
- Runtime: Node.js 24 / Production

In **cPanel > File Manager**, open `/home/akogsfas/pinflix-ebn-app`.
Make a backup of the currently deployed files, in particular the old `.next`
directory. **Enable Show Hidden Files** to see `.next`.

Upload the downloaded ZIP to the application root and extract **there**.
Make sure the files are at the root, not inside a second subdirectory:

```text
/home/akogsfas/pinflix-ebn-app/
  .next/BUILD_ID
  .next/server/
  .next/static/
  package.json
  package-lock.json
  next.config.mjs
  server.cjs
  EBN_BUILD_SHA
  app/
  components/
  data/
  lib/
```

The archive can contain other project directories. A `public/` folder is
optional, not required by this repository's current source tree.

If cPanel File Manager extracts into a nested directory, move the extracted
*contents* (including the hidden `.next` folder) to the application root.

**Never upload this project into the public document root** `/home/akogsfas/abc`.
Disable directory listing there and remove any previously public source checkout
only after backing up and confirming ownership; direct file URLs can remain
accessible even when indexing is off.

## 3. Install runtime packages without compiling

In **cPanel > Setup Node.js App**, confirm Node.js 24, Production,
application root `pinflix-ebn-app`, application URL `abc.pincodeit.com/`
and startup file `server.cjs`.

Use **Run NPM Install** if the installed dependencies are missing or do not match
the delivered `package-lock.json`. If a shell is available, in the activated
Node.js environment use `npm ci --omit=dev --no-audit --no-fund` instead.
For this deployment **do not run `npm run build` on EBN**.

Retain the cPanel-managed `node_modules` link. The GitHub artifact intentionally
does not overwrite it. Do not mix files from different builds in a single
`.next` directory; replace the complete output after creating a backup.

Optionally add a cPanel application environment variable `EBN_COMMIT_SHA`
matching the **full** SHA in `EBN_BUILD_SHA`, then save.

Click **Restart** in Setup Node.js App.

## 4. Check the result

Open:

- http://abc.pincodeit.com/_ebn/health
- http://abc.pincodeit.com/
- http://abc.pincodeit.com/api/catalogue/

Or from Windows PowerShell:

```powershell
curl.exe -i http://abc.pincodeit.com/_ebn/health
curl.exe -I http://abc.pincodeit.com/
```

The health endpoint should return JSON including `"ok":true` and
`"service":"PinFlix"`. If `EBN_COMMIT_SHA` was configured, confirm the
reported commit equals the downloaded build SHA. The homepage must load
Next.js assets, not cPanel's `It works!` placeholder or `Index of /`.

If a restart fails, inspect the cPanel Node.js app logs, confirm the root file
layout and install state, and restore the backed-up release before retrying.
Keep earlier artifacts and backups until deployment has been verified.

## Constraints

- A passing GitHub build does **not** guarantee runtime success on EBN; the
  host's Linux libraries, Passenger process limits and Node.js configuration
  must still be validated.
- GitHub Actions **does not log into cPanel or modify the host**. This workflow
  creates the artifact; an operator uploads and restarts the application.
- The existing `deploy/poll-main.sh` script is a *different* deployment system
  that still builds on the host; disable or migrate its cron schedule separately
  if it is active. Do not allow it to overwrite this direct application.
- HTTP is suitable only for non-sensitive testing. Never use plaintext HTTP
  for logins, payments, tokens or other private data.
- `CINEPLEX_PLAYBACK_AUTHORIZED` remains disabled unless authorized integration
  and actual playback have been verified. The artifact does not grant rights
  to third-party media.
