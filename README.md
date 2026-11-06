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
- **Mix to do**:
  - Inputs: the cylinder's current mix, pressure and water volume; the target pressure; and optional temperature
    compensation.
  - Outputs: the free gas volume, and a reminder of MOD, END, PPO2, PPHe and PPN2.
  - Four cylinders, filled to scale: O2 green, He brown, N2 black, Air blue, empty white, in every theme.
  - The sticker: `Nx: 32 | 28 bar | 200 bar` or `Tx: 21/35 | 19 bar | 89 bar | 200 bar`.
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
docker compose up -d --build                                    # http://127.0.0.1:8080/
docker build -t trimix-blender --build-arg BASE_PATH=/blender . # served under /blender/
E2E_BASE_URL=http://localhost:8080 npx playwright test          # browser tests against the container
```

The build runs the unit tests first. Point the proxy's health check at `/health`. `index.html`, `service-worker.js`
and the manifest are always revalidated (`Cache-Control: no-cache`); hashed files under `_app/immutable/` are cached
forever. This is how a new version reaches users and triggers the reload banner.
