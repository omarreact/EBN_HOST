# PinFlix — UI-only cPanel auto-deployment

This branch is isolated from the Next.js `main` branch.

## Safety contract

Only these cosmetic files are committed and deployed:

- `site/index.html`
- `site/css/cinematic-polish.css`
- `site/js/cinematic-polish.js`

**No PHP, HLS player, media proxy, catalogue, original CDN implementation, or backend configuration is committed or deployed by this branch.** Those remain in the existing, working cPanel document root.

`scripts/verify-ui-only.py` refuses other files in `site/` and confirms the original `hls.js`, `data/catalogue.js`, `js/app.bundle.js`, and `css/styles.css` references stay intact in `index.html`.

The one-time import workflow retrieves the three public presentation files over HTTP and checks their exact SHA-256 hashes against the user's confirmed working ZIP. It **does not use FTP, change cPanel, or deploy**.

## Deploy only after safe FTPS connection test

The FTPS server certificate is issued to `bdix10.ebnserver.com`. Set GitHub Actions secrets for the FTP username, password and remote path; a dedicated cPanel subdomain FTP user is recommended. The current read-only import previously returned `530 Login authentication failed`, so do not enable deployment without confirming valid FTP authentication.

To enable deploy after verification, create the repository Actions variable
`CPANEL_DEPLOY_ENABLED=true` and push safe UI updates to `cpanel-release`.
The workflow stages **only the three files above** and sends them by encrypted FTPS to the existing document root, with no clean-slate deletion.

The previous application-level import script and original checksum manifest remain in `scripts/` for historical verification only; they are NOT part of the deployment.
