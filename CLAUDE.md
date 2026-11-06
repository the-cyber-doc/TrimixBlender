# Trimix Blender: working notes

Static SvelteKit 3 / Svelte 5 (runes) PWA, no backend; structure from ../VideoNinja/frontend.

- **Physics lives only in `src/lib/formulas.ts`**: every formula commented with how and where from (an id of
  `src/lib/references.ts`; `misc.test.ts` checks each reference is cited there). Other modules call it.
- Internal units: bar (gauge for inputs, absolute in physics), K, L, fractions 0..1; depths as ambient pressure.
  The UI converts with `src/lib/units.ts`.
- Logic in `.ts` modules with 100 % unit coverage (thresholds in vite.config.ts: never lower them);
  `.svelte` components stay thin and are covered by Playwright (`tests/`).
- Imports from routes: `#lib/<module>.js` (package.json "imports"; Kit 3 has no `$lib`).
- Gas colours (`src/lib/bottle.ts`) and the sticker are fixed in both themes; everything else uses `src/app.css` tokens.
- Chemical names are plain text: O2, N2, PPO2, PPHe, PPN2, never subscripts.
- Node 26 is under fnm: `export PATH=~/.local/share/fnm/node-versions/v26.12.1/installation/bin:$PATH`.
- Before finishing: `npm run check && npm run lint && npm run test:coverage && npx playwright test`;
  for Docker changes also `tools/test-e2e-stack.sh` (and `--base-path /blender`).
- Browser tests navigate with relative paths (`page.goto('./')`, `'about'`), never `'/…'`: they also run under a base path.
- CI/CD: `.github/workflows/ci-cd.yml` (VideoNinja pattern). A `v*.*.*` tag publishes the amd64+arm64 image and the GitHub release (web build archives + image links).
