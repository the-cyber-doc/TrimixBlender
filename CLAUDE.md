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
- Every user-visible text is in `src/lib/locales/en.ts` and translated in each other locale (same keys and
  `{placeholders}`, checked by `i18n.test.ts`); components read `t` from `#lib/i18n.js` (`fill()` for values).
  Not translated: chemical names, MOD/END, mix names (Air, Nx32), units, the references. A language change re-renders
  the app (`{#key}` in `+layout.svelte`), so `t` needs no reactivity. Flags (`Flag.svelte`) are fixed in both themes.
- Store listings: `fastlane/metadata/`; screenshots: `npm run screenshots` (generated, ignored); see APPSTORE.md.
- Node 26 is under fnm: `export PATH=~/.local/share/fnm/node-versions/v26.12.1/installation/bin:$PATH`.
- Before finishing: `npm run check && npm run lint && npm run test:coverage && npx playwright test`;
  for Docker changes also `tools/test-e2e-stack.sh` (and `--prefix /tools/blender`).
- Publishable in any folder after the build: hash routing + relative URLs (`#lib/base.js`: `page()` for links,
  `asset()` for files; never an absolute `/…`). `scripts/relative-index.js` fixes index.html after `vite build`.
- Browser tests navigate with relative URLs (`page.goto('./')`, `'./#/about'`); every suite also runs from
  `/any/deep/folder/` (playwright.config.ts). Open a hash page as the first navigation of a test, not right after
  another page load (the app's start-up can overwrite the hash).
- Native apps (Capacitor 8, `capacitor.config.ts`, `android/`, `ios/`): `npm run build:native` (APP_TARGET=native →
  `build-native/`, `NATIVE` in `#lib/about.js`: no service worker). Hard rules: no permission (the Android manifest
  removes them, `tools/check-android-apk.sh` checks the APK), no tracker / analytics / Google or Firebase SDK, no
  network use. Android toolchain: JDK 21 + SDK 36.
- F-Droid: recipe `fdroid/com.dolphinslabs.trimixblender.yml` (keep in step with fdroiddata's), tested by
  `tools/test-fdroid-build.sh` (F-Droid's tools and image; CI job "F-Droid build"; APPSTORE.md, F-Droid). Run it after
  changing the native build, npm scripts or the Node version (also pinned in the recipe, with its checksum).
- Releases: `npm version x.y.z && git push --follow-tags`: the Android version is written in `android/app/build.gradle`
  (`scripts/android-version.js`) for F-Droid's update checker; never computed there from the tag.
- CI/CD: `.github/workflows/ci-cd.yml` (VideoNinja pattern). A `v*.*.*` tag publishes the amd64+arm64 image and the GitHub release (web build archives,
  signed APK + AAB, image links, and the IPA if the optional iOS job succeeded); a release fails without the Android
  signing secrets (README, Signing).
