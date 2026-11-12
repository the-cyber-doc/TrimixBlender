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
- **Languages**: English (default), French, German, Spanish, Italian, Dutch, Japanese and Simplified Chinese, chosen
  from the menu (flag and code, first entry). Numbers use the language's decimal separator; both `.` and `,` are
  accepted when typing.
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
| `android/`, `ios/`    | The native apps (Capacitor projects), see below                       |

## Android and iOS apps

Publishing them in Google Play and the App Store, with the listings and screenshots in every language:
[APPSTORE.md](APPSTORE.md).

The same app, packaged with [Capacitor](https://capacitorjs.com/) as a native app for each platform
(`capacitor.config.ts`):

- **Self-contained**: the whole web build is inside the app and served to the web view by the app itself. No server,
  no download, no service worker; it works in flight mode from the first start.
- **No permission**: the Android manifest removes every permission, `INTERNET` included, even any a library would add;
  the iOS app has no usage description (camera, location…), so iOS never asks for anything.
- **No tracker**: no analytics, crash reporting, ads, Firebase or Google Play services. Capacitor itself sends nothing.
  The iOS privacy manifest (`ios/App/App/PrivacyInfo.xcprivacy`) declares no tracking and no data collected.
- Links out of the app (source code, references) open in the system browser.

`tools/check-android-apk.sh <file.apk>` checks a build: no permission, and none of the common tracker SDKs (the
signatures of [Exodus Privacy](https://reports.exodus-privacy.eu.org/en/trackers/)) in its code. CI runs it on every
build.

```sh
npm run build:native     # build-native/ (APP_TARGET=native), copied into android/ and ios/ (cap sync)
npx cap open android     # Android Studio (JDK 21, Android SDK 36): Run, or Build > Generate Signed App Bundle / APK
npx cap open ios         # Xcode (macOS): choose your team in Signing & Capabilities, then Run or Product > Archive
npm run icons            # after changing static/favicon.svg: the PWA, Android and iOS icons and splash screens
```

From the command line, Android: `cd android && ./gradlew assembleRelease` (APK) or `bundleRelease` (AAB, for Google
Play), then `tools/check-android-apk.sh app/build/outputs/apk/release/*.apk`.

Versions: Android's are written in `android/app/build.gradle` by `npm version` (CI and releases below): 1.2.3 has
versionCode 10203 (`major × 10000 + minor × 100 + patch`, which must grow with each store upload). iOS gets the same
numbers from the release's tag.

### Signing

A release (a `v*.*.*` tag) publishes signed apps only: CI fails if an Android signing secret is missing. Other builds
are unsigned when the secrets are absent (Android: unsigned APK and AAB; iOS: an unsigned build, to prove it compiles).
The iOS app is optional: if its job fails (build error, Apple secrets missing or wrong), the run is not failed and the
release is published without the `.ipa`.

**Android.** The key is made once with `keytool`, part of every JDK (Fedora: `sudo dnf install
java-21-openjdk-headless`; Android Studio has one in `jbr/bin/`): it creates the keystore, the private key and its
certificate. The key is ECDSA on the P-521 curve (`secp521r1`), which the APK signature schemes v2 and v3 support on
every Android version the app runs on (7+). Gradle then signs the APK (v2 and v3, with `apksig`, the library of
`apksigner`) and the AAB (JAR signature, what Google Play reads); CI checks both with `apksigner verify` and
`jarsigner -verify`. Keep the keystore and its password safe: every update must be signed with the same key. With Google
Play App Signing, this key is your upload key and Google re-signs the app for the store; check that Play accepts an EC
upload key before relying on it there.

```sh
keytool -J-Dkeystore.pkcs12.macAlgorithm=HmacPBESHA256 -genkeypair -v -keystore release.jks -storetype PKCS12 \
  -alias trimix-blender -keyalg EC -groupname secp521r1 -sigalg SHA512withECDSA -validity 10000
openssl pkcs12 -in release.jks -info -noout   # must say "MAC: sha256", not "PBMAC1" (JDK 21, CI's, cannot read it)
base64 -w0 release.jks   # the value of ANDROID_KEYSTORE_BASE64
```

GitHub secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`trimix-blender`),
`ANDROID_KEY_PASSWORD` (a PKCS12 keystore has a single password: the same as the keystore's). To check an APK by hand:
`apksigner verify --print-certs trimix-blender-1.2.3.apk` (build tools of the Android SDK).

**iOS** (Apple Developer Program; optional, see above). CI archives the app and exports an `.ipa` signed for App Store Connect, with Xcode's
automatic signing: Apple issues and renews the distribution certificate and the profile, no file to keep.

1. In the Apple Developer site, register the app ID `com.dolphinslabs.trimixblender`; in App Store Connect, create
   the app with it.
2. App Store Connect > Users and Access > Integrations > App Store Connect API: create a team key with the **Admin**
   role (needed for cloud-managed certificates) and download its `.p8` (once only).
3. GitHub secrets: `APPLE_TEAM_ID` (Membership details), `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`
   (both on the keys page), `APP_STORE_CONNECT_API_KEY_BASE64` (`base64 -i AuthKey_XXXX.p8`).

**Testing the signing before a release.** Every push already signs and checks the Android app when its secrets are set
(job "Android app", step "Verify the signatures"). For both apps, run the workflow by hand: Actions > CI/CD Pipeline >
Run workflow (choose the branch, "sign" checked), or `gh workflow run ci-cd.yml --ref main -f sign=true`. It builds and
signs both apps as a release does, version 0.0.0, and fails on a missing or wrong secret; nothing is published. The
signed `android-app` (APK, AAB) and `ios-app` (IPA) are the run's artifacts, kept 7 days: `gh run download <run id>`.

The release's `.ipa` is uploaded to App Store Connect (Transporter, or `xcrun altool --upload-app`) for TestFlight and
the App Store review. The app ID is the same on both platforms; it cannot change once the app is in a store.

## Docker

The image is nginx serving the static build. It listens on plain HTTP on port 8080, for your TLS reverse proxy. It runs
as UID 10001 and works with a read-only root filesystem (it writes only to `/tmp`). The base images are Docker Hardened
Images: run `docker login dhi.io` first.

```sh
tools/docker-dev.sh                       # build from this checkout and run: http://127.0.0.1:8080/ (Ctrl+C stops)
tools/docker-dev.sh up -d --build         # any docker compose arguments: up -d, logs -f, down…
docker run -d -p 127.0.0.1:8080:8080 --read-only --tmpfs /tmp <user>/trimix-blender:latest  # a released image
```

All the browser tests against the real container. It runs a throwaway
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
and commit as the `APP_VERSION` and `APP_COMMIT` build arguments; F-Droid's build passes them too (its recipe).

The tag itself is made by `npm version` (CI and releases, below), which also writes the same version into
`package.json` and `android/app/build.gradle`: the About page, the Android app and the iOS app always agree.

## CI and releases

`.github/workflows/ci-cd.yml`. Every push and pull request runs:

1. the type checks, lint, unit tests (100 % coverage), the build and the browser tests;
2. the Docker image for `linux/amd64` and `linux/arm64`, built but not published;
3. the Android app as F-Droid builds it, with F-Droid's own tools (`tools/test-fdroid-build.sh`, see APPSTORE.md,
   F-Droid).

Make a release with `npm version`. It sets the version in `package.json` and in `android/app/build.gradle` (versionName
and versionCode, where F-Droid reads them: `scripts/android-version.js`) and in the F-Droid recipe
(`fdroid/com.dolphinslabs.trimixblender.yml`), commits, and tags `v1.2.3`. Pushing the tag
publishes the release:

```sh
npm version 1.2.3            # or: npm version patch / minor / major
git push --follow-tags
```

`npm version` needs a clean working tree (commit first). The version must be `x.y.z` with minor and patch below 100,
and higher than the last one (Android stores refuse a versionCode that does not grow): `scripts/android-version.js`
stops `npm version` otherwise, before anything is committed or tagged (then undo its change to `package.json` with
`git checkout package.json package-lock.json`). A release fails if its tag is not the version in
`android/app/build.gradle` (a tag made by hand with `git tag`), or if F-Droid's tools cannot build it.

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
