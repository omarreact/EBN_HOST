# Automatic EBN deployment

Target repository: `omarreact/EBN_HOST`, branch `main`. Dedicated server root: `/home/akogsfas/ebn-host`.

The server polls GitHub every minute. When main changes, it extracts the exact commit into a new retained release, installs dependencies if needed, runs the build if present, tests application startup, and requests a Passenger restart after activation. Failed builds keep the previous release active. This is scheduled automatic deployment, with up to one minute plus build time of delay; it is not an instant GitHub webhook or a full Vercel platform.

No cleanup, git reset, git clean, rsync deletion, production database migration, or changes to other project directories are included. Earlier releases and pointer snapshots are retained. Retention consumes the account's disk and inode quota; future cleanup requires the user's authorization.

## Hosting setup

The deployment checkout is `/home/akogsfas/ebn-host`. A separate runtime checkout is `/home/akogsfas/ebn-host-runtime`, configured in CloudLinux Setup Node.js App with Node 24, Production mode, startup `bootstrap.cjs`, and environment variable `EBN_DEPLOY_ROOT=/home/akogsfas/ebn-host`.

Live URL: `http://test.pincodeit.com/ebn-host-live/`. The existing PHP diagnostics, static prototype and initial `/ebn-host/` bootstrap app are retained. The initial worker did not refresh through cPanel restart controls or Passenger restart.txt, so the fresh runtime watches the validated release pointer and exits when it changes; the host starts a fresh worker on the next request. A deployment can cause a brief restart interruption. This is not zero-downtime deployment.

Add a dedicated cron entry:

```cron
* * * * * /bin/bash /home/akogsfas/ebn-host/deploy/poll-main.sh
```

Deployment log: `/home/akogsfas/ebn-host/.deploy/deploy.log`. This cron does not require GitHub or cPanel API credentials because the repository is public. Do not put secrets into the repository. Configure runtime secrets privately. The cron/build environment needs any build-time settings separately; cPanel application runtime variables are not automatically inherited by cron.

## Commit your application

Keep `bootstrap.cjs` and `deploy/poll-main.sh` as the stable server controller. Put your application's code and package.json in this repository and update `deploy/config.json` with its relative startup file and an HTTP health path. A Next.js server application needs a compatible custom startup file such as `server.cjs`; deployment under this URL prefix also requires framework routing/assets configuration appropriate to `/ebn-host-live`. Static-only projects need a suitable static server startup file. This pipeline does not automatically adapt every framework.

The cPanel checkout's controller remains pinned to its installed version: fetching main updates Git objects without deleting or checking out source files. Updating the controller itself needs an explicit separately reviewed controller upgrade. Normal app source and deployment configuration come from each new main commit.

The initial `server.cjs` page is a deployment test, not the completed PinFlix application. It exposes only the commit ID and Node version. Its `/_ebn/health` route verifies the active commit. Root health/startup success is a limited test; project-specific CI and playback tests remain necessary.

For dependencies, install/build compatibility with CloudLinux must be tested for the actual project. Large Next.js builds may exceed shared hosting limits. Databases, uploaded media and secrets should be stored separately from immutable source releases.
