# Trimix Blender

A progressive web app for partial-pressure blending of **air, nitrox and trimix**. It works out how much O2, then He,
then top-up gas to add to a cylinder, and shows the four stages as cylinders and the label to stick on it.

- Frontend only: no backend, no data leaves the device. Works **100 % offline** once loaded, and installs as an app.
- Real-gas maths: each gas's compressibility is fitted to NIST reference data. An ideal-gas mode is a preference.
- Every formula, with its derivation and source, is in one file: [`src/lib/formulas.ts`](src/lib/formulas.ts). The
  bibliography is on the About page ([`src/lib/references.ts`](src/lib/references.ts)).

> Gas blending is dangerous. Use this only if you are trained to blend, and always analyse the final mix.

## Features

- **Available gases**: register any number of sources (name, O2 %, He %, pressure) and check the ones to use. The
  defaults are O2 200 bar, He 200 bar, Air 200 bar and Air 300 bar. A source cannot fill above its own pressure (no
  booster), so the blend picks the lowest-pressure bank that works, unless you choose one.
- **Target mix**: Nitrox or Trimix, with an optional depth. The linked fields are %O2 ↔ MOD ↔ PPO2 (1.4 by default) and
  %He ↔ END. %N2 is shown.
- **Gas density**: the mix's density at the target depth (at the MOD without a depth), with the depths where it
  reaches the ceilings of Anthony & Mitchell (2016): 5.2 g/l recommended, 6.2 g/l absolute maximum. Above them, the
  app warns. It computes ρ = P × M / (Z × R × T) at 0 °C, the basis of the published limits.
- **Mix to do**:
  - Inputs: the cylinder's current mix, pressure and water volume; the target pressure; and optional temperature
    compensation.
  - Outputs: the free gas volume, and a reminder of MOD, END, PPO2, PPHe and PPN2.
  - Four cylinders, filled to scale: O2 green, He brown, N2 black, Air blue, empty white, in every theme.
  - The sticker: `Nx: 32 | O2 28 bar | 200 bar` or `Tx: 21/35 | O2 19 bar | He 89 bar | 200 bar`.
  - Impossible mixes are explained. When the cylinder holds too much O2, too much He or too much gas, the app gives the
    pressure to drain it down to.
- **Preferences**: °C/°F, bar/psi, l/cu ft, m/ft, real/ideal gases, END with O2 narcotic or N2 only.
- **Updates**: when a new version is deployed, a banner offers to reload.

## How the maths works (summary; details in `formulas.ts`)

- Gauge readings become absolute pressures (+1.01325 bar). The blend is a mole balance per gas (O2, He, total), solved
  as a 3×3 linear system (2×2 for nitrox). Every amount must be ≥ 0, or the mix is impossible.
- Z(P, T) of O2, N2 and He is a polynomial (4th order in P, 2nd in T), fitted to NIST WebBook data from −10 to +60 °C
  and up to 351 bar. It matches that data within 0.11 %. A mix's Z follows Amagat's law.
  - The data is in `scripts/nist/`. `npm run nist:fetch` downloads it again, and `npm run nist:fit` regenerates
    `src/lib/compressibility-coefficients.ts`.
  - Van der Waals was rejected: it gives Z ≈ 1.19 for He at 200 bar, against the real 1.097.
- Temperature compensation: the target pressure is defined at 15 °C (ISO 10286 reference). The pressures shown are the
  readings at the filling temperature.

## Development

Node ≥ 22.17.

```sh
npm ci
npm run dev            # http://localhost:5173
npm run check          # svelte-check + service worker types
npm run lint           # prettier + eslint
npm run test:coverage  # unit tests, 100 % coverage of every .ts module required
npx playwright install chromium
npm run test:browser   # Playwright: pages, phone layout, offline service worker, update banner
```

Layout:

| Path                  | What                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| `src/lib/formulas.ts` | All physics and diving formulas, commented and cited                  |
| `src/lib/blend.ts`    | The blend solver: stages, source choice, impossible mixes, drain-down |
| `src/lib/target.ts`   | Target mix and its linked fields                                      |
| `src/lib/units.ts`    | Preferences, unit conversion and formatting                           |
| `src/lib/*.svelte`    | UI components (logic stays in `.ts`, unit-tested)                     |
| `src/service-worker/` | Offline cache of the whole app                                        |
| `tests/`              | Playwright browser tests                                              |

## Docker

The image is nginx serving the static build. It listens on plain HTTP on port 8080, for your TLS reverse proxy. It runs
as UID 10001 and works with a read-only root filesystem (it writes only to `/tmp`). The base images are Docker Hardened
Images: run `docker login dhi.io` first.

```sh
tools/docker-dev.sh                       # build from this checkout and run: http://127.0.0.1:8080/ (Ctrl+C stops)
tools/docker-dev.sh up -d --build         # any docker compose arguments: up -d, logs -f, down…
docker run -d -p 127.0.0.1:8080:8080 --read-only --tmpfs /tmp <user>/trimix-blender:latest  # a released image
```

All the browser tests against the real container (as `tools/test-e2e-stack.sh` in VideoNinja). It runs a throwaway
compose project on port 8090 (`E2E_PORT`), which is removed at the end:

```sh
tools/test-e2e-stack.sh                                   # the image built from this checkout
tools/test-e2e-stack.sh --prefix /tools/blender          # the same image behind an nginx proxy, under /tools/blender/
tools/test-e2e-stack.sh --images user/trimix-blender:1.2.3   # a published release, pulled
tools/test-e2e-stack.sh -- -g "offline"                   # Playwright arguments after --
```

Both scripts use `sudo docker` by themselves when your user cannot reach Docker. `--prefix` puts the README's
[sub-folder proxy](#nginx-reverse-proxy) in front of the unchanged image: one image, any path.

The build runs the unit tests first. Point the proxy's health check at `/health`. `index.html`, `service-worker.js`
and the manifest are always revalidated (`Cache-Control: no-cache`); hashed files under `_app/immutable/` are cached
forever. This is how a new version reaches users and triggers the reload banner.

## Deployment: Docker Compose behind an nginx proxy

The container serves the app over plain HTTP on port 8080. Your reverse proxy adds HTTPS and your domain. HTTPS is
required: without it, browsers refuse the service worker, so there is no offline use and no install.

### docker-compose.yml

The published image (see [CI and releases](#ci-and-releases)), served at the root of a (sub)domain:

```yaml
# /opt/trimix-blender/docker-compose.yml
#   docker compose up -d                              start
#   docker compose pull && docker compose up -d       update to the latest 1.x
services:
  trimix-blender:
    image: thecyberdoc/trimix-blender:1 # updates within 1.x; or a fixed release: :1.2.3
    container_name: trimix-blender
    restart: unless-stopped
    ports:
      - '127.0.0.1:8080:8080' # this host only: the proxy is the way in
    # Nothing to keep: no volume. Read-only, it writes only to /tmp.
    read_only: true
    tmpfs:
      - /tmp
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    # No healthcheck: the hardened image has no shell or HTTP client. Check GET /health
    # (answers "ok") from your proxy or monitoring.
```

If nginx itself runs in a container, put both on one Docker network and remove `ports:`. Then proxy to
`http://trimix-blender:8080` instead of `http://127.0.0.1:8080`.

The same image serves any path: at a domain's root, or in a sub-folder chosen by your proxy (below).

### nginx reverse proxy

**On its own (sub)domain** (recommended): `https://blender.example.org/`.

```nginx
# /etc/nginx/sites-available/blender.example.org
server {
    listen 80;
    listen [::]:80;
    server_name blender.example.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;                      # nginx < 1.25.1: "listen 443 ssl http2;" instead
    server_name blender.example.org;

    ssl_certificate     /etc/letsencrypt/live/blender.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blender.example.org/privkey.pem;

    # HSTS: the proxy's to decide, not the app's. Add includeSubDomains only if every
    # subdomain has HTTPS.
    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection        "";
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Overwrite, never append ($proxy_add_x_forwarded_for): the container logs this
        # single value as the client's address (it trusts it from private addresses only).
        proxy_set_header X-Forwarded-For   $remote_addr;
    }
}
```

**In a sub-folder** of an existing site, any one you like: `https://example.org/blender/`. Same image, nothing to
rebuild. Add these to the `server` block that already serves `https://example.org`:

```nginx
location = /blender {
    return 301 /blender/;
}

location /blender/ {
    # Trailing slash: the prefix is stripped, /blender/x reaches the container as /x.
    proxy_pass http://127.0.0.1:8080/;
    proxy_http_version 1.1;
    proxy_set_header Connection        "";
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For   $remote_addr;
}
```

In a sub-folder the app shares its origin with the rest of the site. Browsers isolate by origin, not by path, so the
site's other pages could read the app's saved preferences and blend. These hold no secrets, but a subdomain keeps the
app apart.

Leave the container's response headers alone: no proxy caching, and no `add_header Cache-Control` or
`Content-Security-Policy` of your own in these locations. The container sends the right ones:

- `Cache-Control: no-cache` on `index.html`, `service-worker.js` and the manifest, so users get new versions and the
  "reload" banner;
- immutable caching on the hashed files;
- a CSP and the other security headers.

The precompressed `.gz` files pass through as they are.

Check, then reload: `sudo nginx -t && sudo nginx -s reload`. Then, from outside:

```sh
curl -sI https://blender.example.org/ | grep -iE '^(HTTP|cache-control|strict-transport|content-security)'
curl -s https://blender.example.org/health        # ok   (sub-folder: https://example.org/blender/health)
```

## Any folder, decided after the build

The app has a single page, `index.html`. Its own pages are in the hash: `…/#/about`, `…/#/preferences`. Every URL in it
is relative (`./_app/…`, `./favicon.svg`), so the same build works wherever `index.html` is published, whether in a
folder of a web server or behind a proxy that strips its prefix.

- SvelteKit's hash router (`vite.config.ts`) works out the folder in the browser.
- `scripts/relative-index.js` makes the last absolute paths, the ones SvelteKit writes into `index.html`, relative
  after `vite build`. It also updates the hash of the page's inline script in its Content-Security-Policy.

## Version shown on the About page

At build time (`vite.config.ts`), the version comes from git:

- A clean checkout of a tag `v1.2.3` shows **1.2.3**. Release builds, in CI and in the release's image and archives,
  get it this way.
- Any other build shows **dev (build <id>)**. The id is the commit (`abc1234`, `abc1234-dirty` with uncommitted
  changes), or the build time (`20261106T1435`) when there is no git at all.

The Docker image's build has no `.git`, so `tools/docker-dev.sh`, `tools/test-e2e-stack.sh` and the CI pass the version
and commit as the `APP_VERSION` and `APP_COMMIT` build arguments.

## CI and releases

`.github/workflows/ci-cd.yml`, as in VideoNinja. Every push and pull request runs:

1. the type checks, lint, unit tests (100 % coverage), the build and the browser tests;
2. the Docker image for `linux/amd64` and `linux/arm64`, built but not published.

Pushing a version tag also publishes the release:

```sh
git tag v1.2.3 && git push origin v1.2.3
```

- **Docker Hub:** `<user>/trimix-blender` with the tags `1.2.3`, `1.2`, `1` and `latest`. One multi-architecture
  image (amd64 + arm64), with its SBOM and build provenance.
- **GitHub release `v1.2.3`:**
  - `trimix-blender-1.2.3-web.tar.gz` and `.zip`: the static build in a `trimix-blender/` folder, to serve as is.
  - `SHA256SUMS`.
  - Release notes with links to the Docker images (Docker Hub tag page, `docker pull` by tag and by digest).

Repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`. The same account pulls the `dhi.io` base images.
Dependabot needs these as Dependabot secrets too.

### Serving the web build with another web server

Copy the release archive's `trimix-blender/` folder (or your own `build/`) into **any folder** of any web server and
open that folder's URL: `https://example.org/`, `https://example.org/tools/blender/`… The folder is chosen after the
build, with no rewrite rule and no configuration. The browser tests do exactly this with `/any/deep/folder/`.

The server needs nothing special, but:

- send `Cache-Control: no-cache` (or a short cache) for `index.html`, `service-worker.js` and `manifest.webmanifest`,
  or users stay on an old version. Files under `_app/immutable/` can be cached forever.
- use HTTPS (or `localhost`): browsers allow a service worker, and so offline use, only there.

The `.gz` and `.br` files next to each file are precompressed copies, for servers that can serve them (nginx
`gzip_static`). Other servers ignore them.
