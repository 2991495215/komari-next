# s3 production deployment

The production theme uses `custom/zinc`. Its deployed application sources were checked against commit `97d9e54eab326c93bdd268ad631bfae5ca557e1f` on 2026-10-01: 90 source files matched after newline normalization, and three locale JSON files matched by value. The source maps contain processed CSS and do not prove a complete reproducible build.

## Files and locations

| Repository | s3 |
| --- | --- |
| `komari-theme.json` | `/opt/komari/data/theme/next/komari-theme.json` |
| built `dist/` | `/opt/komari/data/theme/next/dist/` |
| `deploy/s3/overrides/` | `/opt/1panel/www/komari-overrides/` |
| `deploy/s3/openresty.conf` | `/opt/1panel/www/conf.d/k.trent30.com.conf` |
| `deploy/s3/Dockerfile.security` | `/opt/komari/Dockerfile.security` |

`openresty.conf` injects `_zinc-brand.js` into HTML and serves the override files. The script changes the title, branding, links and badge colors. The background is configured through Komari's existing `backgroundImageUrl` setting. The four legacy Vite chunks are retained because the active proxy still serves them; they are not the current Next.js application's source. Old chunk-name substitutions in the proxy do not match the current Next.js bundles.

The existing deployment intentionally disables Service Worker caching: `_zinc-brand.js` unregisters workers and clears CacheStorage, `sw.js` retires an older worker, and `registerSW.js` does not register a new worker. These files preserve the current deployment behavior; this change does not restore offline PWA support. Do not remove them without testing migration from old clients.

The theme metadata is aligned with the repository's `ZINC Next` version `1.4.19`, including `compact` layout and `guestDisplay.showPrice` / `guestDisplay.showExpiredAt` configuration fields. This metadata version is distinct from the Komari backend image version `1.5.1`. Actual site settings remain in Komari's database and are not included here.

## Verification and maintenance

Run `node deploy/s3/verify.mjs --live` from this checkout. It checks script syntax, metadata, deployment file hashes through the configured SSH alias `s3`, and the public page and overrides. It is read-only. Without `--live`, it checks local files only.

On s3 itself, use `node deploy/s3/verify.mjs --live --local-deployment` to check deployment files directly without an SSH alias.

The backend currently runs image `komari-security:20261005`. `Dockerfile.security` preserves its build recipe: Komari revision `f0cc0fba38ce161935372633cae5248c934e2b23`, backend version `1.5.1`, frontend tag `1.5.0-fix1`, and Go `1.25.7`. This recipe is not a database backup or a fully pinned image archive. PostgreSQL metrics, SQLite settings, credentials, sessions and agent tokens stay outside Git.

Application changes require a fresh `npm ci` and `npm run build`, followed by deploying the generated theme files. Override changes also require deploying `deploy/s3/overrides/`; they are not included by the existing theme ZIP builder. If the proxy configuration changes, run OpenResty's configuration check before reloading it. TLS certificates, private keys, database contents, authentication and other sites are not part of this repository.
