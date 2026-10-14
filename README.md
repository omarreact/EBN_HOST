# PinFlix — cPanel production branch

This **cpanel-release** branch is isolated from Next.js **main** and the Vercel production project.

## One-time source upload to GitHub (not cPanel)

The user's working PHP/cPanel application has already been uploaded to hosting.
The GitHub release branch is initially created with deployment infrastructure only.
Unzip the previously provided **PinFlix-GitHub-AutoDeploy-FTPS-Kit.zip**, then
copy its **site/** directory to the root of **this branch** using GitHub's
file uploader or GitHub Desktop. Preserve every file and its relative path.

The workflow validates the exact 14 original playback, API, CDN,
catalogue and base-style file SHA-256 values. It will **refuse to deploy** if
any are missing or modified. Cosmetic updates belong in `site/index.html`,
`site/css/cinematic-polish.css` and `site/js/cinematic-polish.js`.

## One-time credentials setup

In the GitHub repository Settings > Secrets and variables > Actions,
add **repository secrets**:

- CPANEL_FTP_HOST — FTP server hostname, never an HTTP URL
- CPANEL_FTP_USERNAME — restricted cPanel subdomain FTP user
- CPANEL_FTP_PASSWORD — corresponding password
- CPANEL_FTP_REMOTE_DIR — directory from FTP account root, ending in / (often ./)

Use a dedicated FTP account limited to the **PinFlix subdomain document root**,
with explicit FTPS and a valid TLS certificate. Do not paste passwords into
GitHub files, issues, or ChatGPT conversations.

Optionally set a `cpanel-production` GitHub environment with protections.
**Only after uploading and verifying `site/` and adding secrets,** set
Actions repository variable `CPANEL_DEPLOY_ENABLED=true`.

Then commit a safe cosmetic change to this branch to trigger the pipeline,
or use workflow dispatch when available in your GitHub Actions UI.

The uploader uses incremental FTPS from **site/** only; it never intentionally
clears the entire server directory. Always maintain a cPanel backup.
A deployment cannot be guaranteed until the FTPS settings and hosting
connectivity are tested.

Vercel serves the separate Next.js application; its production configuration
is not changed by this branch.

## GitHub links

- Branch: https://github.com/omarreact/PinFlix_Development/tree/cpanel-release
- Workflow: .github/workflows/cpanel-ftps.yml
