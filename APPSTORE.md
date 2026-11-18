# Publishing in the stores

How to publish Trimix Blender on Google Play and the Apple App Store, in all its languages, and where else it can go.
The signed apps come from CI: a `v*.*.*` tag attaches the APK, the AAB and, if the optional iOS job succeeded, the IPA
to the GitHub release (README, Signing).

> Store rules, fees and limits change. Everything below was checked in November 2026; if a console disagrees, the
> console is right.

## What is in the repository

| Path                                              | What                                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `fastlane/listings.json`                          | **The listings' texts, in every language**: title, short and full description, and the locale codes                                      |
| `fastlane/metadata/android/<locale>/`             | Google Play listing: `title.txt`, `short_description.txt`, `full_description.txt` (from the JSON)                                        |
| `fastlane/metadata/android/en-US/images/icon.png` | The 512 × 512 store icon                                                                                                                 |
| `fastlane/metadata/ios/<locale>/`                 | App Store listing: `name.txt`, `description.txt` (from the JSON); `subtitle.txt`, `keywords.txt`, `promotional_text.txt`, URLs (by hand) |
| `fastlane/changelog.json`                         | **The release notes, in every language**, one entry per version: stores, GitHub release and About page (below)                           |
| `fastlane/metadata/ios/*.txt`                     | App Store, all languages: copyright, categories (Sports, Utilities)                                                                      |
| `PRIVACY.md`                                      | The privacy policy both stores require (its GitHub URL is in the listings)                                                               |
| `npm run listings`                                | Writes the listings' and release notes' text files from the JSONs (below)                                                                |
| `npm run screenshots`                             | Generates the screenshots (committed, see below)                                                                                         |
| `npm run store`                                   | Both                                                                                                                                     |

The listings exist in 8 languages, with each store's locale code:

| App                | Google Play, F-Droid | App Store |
| ------------------ | -------------------- | --------- |
| English (default)  | `en-US`              | `en-US`   |
| French             | `fr-FR`              | `fr-FR`   |
| German             | `de-DE`              | `de-DE`   |
| Spanish            | `es-ES`              | `es-ES`   |
| Italian            | `it-IT`              | `it`      |
| Dutch              | `nl-NL`              | `nl-NL`   |
| Japanese           | `ja-JP`              | `ja`      |
| Simplified Chinese | `zh-CN`              | `zh-Hans` |

### Texts: one source, `fastlane/listings.json`

Each language has one title, one short description and one full description (an array of lines), shared by the three
stores: edit them only in `fastlane/listings.json`, then `npm run listings` (`scripts/store-listings.js`) writes
each store's files under its own names (F-Droid reads Google Play's, from the sources at the tag):

| JSON                | Google Play, F-Droid    | App Store         |
| ------------------- | ----------------------- | ----------------- |
| `title`             | `title.txt`             | `name.txt`        |
| `short_description` | `short_description.txt` | (none)            |
| `full_description`  | `full_description.txt`  | `description.txt` |

The script checks the limits (title 30 characters, short description 80, full description 4000) and that each full
description starts with the short description's first sentence, "No account, no ads, no tracker." in its language.
The App Store's subtitle (30 characters), keywords and
promotional text have no equivalent in the other stores: they stay in `fastlane/metadata/ios/<locale>/`, edited by
hand. Never edit the written files: `npm run test:unit` fails when they differ from the JSON.

**Have every translation checked by a diver who is a native speaker** before publishing, the app's warnings first
(`src/lib/locales/*.ts`), then the listings. They were drafted by an AI.

### Release notes: one source, `fastlane/changelog.json`

One entry per version, newest first, with its lines in each language of the listings:

```json
[{ "version": "1.1.0", "en": ["Gas density shown at each step."], "fr": ["…"], "de": ["…"] }]
```

`npm run listings` also runs `scripts/changelog.js`, which writes:

| Where       | File                                                              | Versions        |
| ----------- | ----------------------------------------------------------------- | --------------- |
| Google Play | `fastlane/metadata/android/<locale>/changelogs/<versionCode>.txt` | every one       |
| F-Droid     | the same, read from the sources at the tag                        | every one       |
| App Store   | `fastlane/metadata/ios/<locale>/release_notes.txt`                | the newest only |

versionCode of 1.2.3 is 10203 (`scripts/android-version.js`). The GitHub release starts with the English lines of its
version ("What's new", ci-cd.yml), and the About page lists every version in the app's language
(`src/lib/changelog.ts`). The script checks each version (x.y.z, newer than the one below it), every language and
Google Play's limit of 500 characters per version and language; `npm run test:unit` fails when the written files differ
from the JSON.

**To release**: add the version's entry at the top of `fastlane/changelog.json`, run `npm run listings`, commit, then
`npm version x.y.z`, which fails if the newest entry is not that version, and commits the written files with the
version.

### Screenshots

`npm run screenshots` builds the app and takes, for each language, each area of the app (Available gases, Target
mix, Mix to do) for a nitrox and a trimix blend: 6 per device and language, 192 in all, a phone and the tablets for
each store (`playwright.screenshots.config.ts`, `tests/screenshots/store.spec.ts`).

| Device                  | Size (px)   | Written to                                                                            |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------- |
| Android phone           | 1320 × 2640 | `fastlane/metadata/android/<locale>/images/phoneScreenshots/`                         |
| Android 7" tablet       | 1200 × 1920 | `fastlane/metadata/android/<locale>/images/sevenInchScreenshots/`                     |
| Android 10" tablet      | 2064 × 2752 | `fastlane/metadata/android/<locale>/images/tenInchScreenshots/` (links to the iPad's) |
| iPhone 6.9" (App Store) | 1320 × 2868 | `fastlane/screenshots/ios/<locale>/`                                                  |
| iPad 13" (App Store)    | 2064 × 2752 | `fastlane/screenshots/ios/<locale>/`                                                  |

The Android phone screenshots show what the iPhone's show (same width), cut to 2:1: Google Play takes 2 to 8 phone
screenshots per language, each side from 320 to 3840 px and the long side at most twice the short one, and the
iPhone's are 2.17:1. The 7" tablet is a 600 × 960 dp screen; the 10" tablet is the iPad. A link is a relative symlink,
not a copy: fastlane follows them, and `cp -rL` copies the files they point to. The App Store requires the 6.9" iPhone
set and, because the app also runs on iPad, the 13" iPad set; it takes up to 10 per device and language. They are
generated but committed (about 35 MB), so that F-Droid and the other platforms' builds find them at the tag; run the command again after any visible change, or `npm run
store` after a change of the texts as well (README, Store listings and screenshots).

### Still to make by hand

- **Google Play feature graphic** (required): 1024 × 500 PNG or JPEG, in
  `fastlane/metadata/android/<locale>/images/featureGraphic.png` (one per language if it holds text, else `en-US`
  only).

## 1. Developer accounts

### Google Play Console

1. Sign up at <https://play.google.com/console/signup> with a Google account kept for this purpose.
2. Choose **Personal** (you, as a private person) or **Organisation** (a company: needs a D-U-N-S number, free from Dun
   & Bradstreet, which takes days to weeks).
3. Pay the **one-time USD 25** fee and verify your identity (official ID; organisations also their address and
   website). Google also verifies a phone number and, for an organisation, may verify the website.
4. **New personal accounts must test first**: before the app can go to production, a closed test with at least
   **12 testers** opted in for **14 days in a row**. Plan for it: invite friends from your dive club by email list or
   Google Group, and keep them opted in.

### Apple Developer Program

1. An Apple Account with two-factor authentication.
2. Enrol at <https://developer.apple.com/programs/enroll/> (or in the Apple Developer app): **USD 99 a year** (or the
   local price). **Individual**: the store shows your legal name as the seller. **Organisation**: needs a D-U-N-S
   number and a legal entity; the store shows the company's name.
3. In App Store Connect, **Business**: a free app needs only the Free Apps agreement (accepted with the program); tax
   and banking forms are only for paid apps.
4. **EU (Digital Services Act)**: to be on the store in the EU you must declare whether you are a **trader**. A
   trader's address, phone and email are shown on the App Store page. A hobby project without any commercial intent
   can usually declare itself a non-trader; ask for advice if unsure. Google Play asks a similar question.

## 2. Google Play

### Create the app (once)

Play Console > **Create app**: name `Trimix Blender`, default language **English (United States) – en-US**, App, Free.
Then **Dashboard > Set up your app**, every item:

- **Privacy policy**: `https://github.com/the-cyber-doc/TrimixBlender/blob/main/PRIVACY.md`
- **App access**: all functionality is available without special access.
- **Ads**: no ads.
- **Content rating**: the IARC questionnaire (category: utility/productivity; no violence, no user content, nothing to
  buy). It gives a rating per region.
- **Target audience**: 18 and over (a tool for trained gas blenders; it also keeps the Families policy out of scope).
- **Data safety**: no data collected, no data shared. The app uses no network at all.
- **Government app, financial features, health**: no.
- **Store settings**: category **Sports** (or Tools), contact email (shown publicly), website: the GitHub page.

### App signing: decide before the first upload

Play requires **Play App Signing**: you upload an AAB signed with your **upload key** (the keystore of the README), and
Google signs what users install with the **app signing key**, which it keeps.

- By default Google generates the app signing key. Then the APK on the GitHub release (signed with your key) and the
  app from Play have **different signatures**: Android refuses to update one with the other, a user must uninstall
  first (losing the saved blend).
- To keep one signature everywhere, at the first upload choose **Use a different app signing key** and upload your own
  key (Play Console gives the PEPK tool and the exact command). Then make a **second, separate upload key** for CI.
  This choice cannot be changed later without Google's support.

### Listing in all languages

**Grow users > Store presence > Main store listing**: fill English, then **Manage translations > Add your own
translations**, and tick French, German, Spanish, Italian, Dutch, Japanese, Chinese (Simplified). For each: title,
short description, full description from `fastlane/metadata/android/<locale>/`, the phone, 7" and 10" tablet
screenshots, and the feature graphic. Do not use Google's machine translation of the listing: ours is checked and has the right diving terms.

Faster, and repeatable: upload them all with **fastlane** (below).

### Release

1. **Testing > Closed testing** (or Internal testing, for yourself, without review): create a release, upload
   `trimix-blender-<version>.aab` from the GitHub release, add release notes, roll out.
2. After the 14-day test (new personal accounts), **Dashboard > Apply for production**, answer the questions about the
   test.
3. **Production > Create new release**: the same AAB (or promote the tested release), roll out. Review takes from a few
   hours to a few days.

New apps must target a recent Android version (the requirement moves each August); the app targets API 36
(`android/variables.gradle`).

### Upload with fastlane (optional)

[fastlane](https://docs.fastlane.tools/) uploads the listings, screenshots and AAB of every language in one command.
Install: `gem install fastlane` (Ruby), or `brew install fastlane`.

Access, once: in Google Cloud, create a project, enable the **Google Play Android Developer API**, create a **service
account** and a JSON key for it; in Play Console > **Users and permissions**, invite the service account's email with
the rights to edit the listing and release to testing tracks. Keep the JSON out of the repository.

```sh
npm run screenshots   # the phone and tablet screenshots, into fastlane/metadata/android/
# Listings and screenshots only:
fastlane supply --package_name com.dolphinslabs.trimixblender --json_key ~/keys/play.json \
  --metadata_path fastlane/metadata/android --skip_upload_apk --skip_upload_aab --skip_upload_changelogs
# The AAB to the internal test track (the first upload must be done in the console):
fastlane supply --package_name com.dolphinslabs.trimixblender --json_key ~/keys/play.json \
  --metadata_path fastlane/metadata/android --aab trimix-blender-1.2.3.aab --track internal
```

## 3. Apple App Store

### Create the app (once)

1. **Certificates, Identifiers & Profiles > Identifiers**: register the App ID `com.dolphinslabs.trimixblender` (no
   capability needed). CI signs with the App Store Connect API key (README, Signing).
2. **App Store Connect > Apps > + > New App**: iOS, name `Trimix Blender`, primary language **English (U.S.)**, the
   bundle ID above, SKU `trimix-blender`, full access.
3. **App Information**: category **Sports**, secondary **Utilities**; content rights: no third-party content; **age
   rating** questionnaire (nothing applies: lowest rating).
4. **App Privacy**: privacy policy URL (as for Play), then **Data Not Collected**.
5. **Pricing and Availability**: free, all countries (or a choice).

### Listing in all languages

On the app version's page, the language menu at the top right: **add each language** (French, German, Spanish,
Italian, Dutch, Japanese, Chinese (Simplified)). For each: screenshots (iPhone 6.9" and iPad 13"), promotional text,
description, keywords, support URL, marketing URL, from `fastlane/metadata/ios/<locale>/`. The name and subtitle
are under **App Information**, per language too.

The keywords (100 characters, comma-separated, not shown) weigh most in App Store search: do not repeat words already
in the name or subtitle, and keep the English diving terms in every language (divers search for "nitrox" and "MOD"
everywhere).

The store's **Languages** line comes from the app itself: `CFBundleLocalizations` in `ios/App/App/Info.plist` and the
project's known regions declare the 8 languages. Check it on the TestFlight build's page; if only English shows, add
the languages in Xcode (Project > Info > Localizations).

### Build and review

1. **A release uploads it** (`npm version x.y.z && git push --follow-tags`): CI's "iOS app" job signs the IPA, then
   fastlane uploads it to App Store Connect and the version's listing in every language (below). By hand, from any
   computer: `bundle exec fastlane ios upload ipa:trimix-blender-1.2.3.ipa`.
2. The build appears in **TestFlight** after processing (minutes). Export compliance is already answered in
   `Info.plist` (no encryption besides the system's). Test it yourself (internal testing needs no review).
3. On the version's page, check the listing, select the build, fill **App Review Information** (contact; no sign-in
   needed) and submit. Review usually takes one to two days.

**Review risk: guideline 4.2, minimum functionality.** Apple rejects apps that are only a website in a wrapper. In the
review notes, say what the app is: a self-contained calculator that works fully offline, its whole code inside the
app, no web content loaded. Mention the real-gas model and the drawings. If rejected, answer in Resolution Center
with the same points before changing anything.

### Upload with fastlane

`fastlane/Fastfile` has two lanes, with the App Store Connect API key of CI's signing (README, Signing), read from the
same three variables as the GitHub secrets:

| Lane                             | Uploads                                                                                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fastlane ios upload ipa:<file>` | The signed IPA, to TestFlight                                                                                                                                                                            |
| `fastlane ios metadata`          | For package.json's version (created if missing): every language's texts and release notes (`fastlane/metadata/ios/`), categories, copyright, and the screenshots (`fastlane/screenshots/ios/`, replaced) |

CI runs both on a release's tag, after signing (not on a manual signed run). Neither submits for review. fastlane
is pinned in `Gemfile.lock` (Dependabot updates it); `deliver` tells the iPhone and iPad screenshots apart by their
size.

By hand (Ruby 3.2 or later: `sudo dnf install ruby ruby-devel`, `brew install ruby`), for example after changing the
listing or the screenshots between releases:

```sh
npm run store   # the texts and screenshots
bundle install
export APP_STORE_CONNECT_KEY_ID=<KEY_ID> APP_STORE_CONNECT_ISSUER_ID=<ISSUER_ID> \
  APP_STORE_CONNECT_API_KEY_BASE64="$(base64 -w0 ~/keys/AuthKey_<KEY_ID>.p8)"
bundle exec fastlane ios metadata
```

## 4. Other places

- **GitHub releases**: already done by CI (APK for direct install, the web build, the Docker image).
- **IzzyOnDroid** (<https://apt.izzysoft.de/fdroid/>): an F-Droid repository that takes the signed APK from the GitHub
  releases; ask for inclusion with an issue there. It reads the listing from `fastlane/metadata/android/` (the
  screenshots too, which would then have to be committed).
- **F-Droid** (main repository): builds the app itself from the sources; see below.
- **Android developer verification**: Google announced that, from 2026 onwards and country by country, apps installed
  on certified Android phones must come from a verified developer, sideloaded ones included. A Play Console account
  is verified; check the current status for the APK published on GitHub.

## 5. F-Droid

F-Droid builds the app on its own servers from the sources of a release's tag, following a build recipe kept in its
`fdroiddata` repository, and signs it with its own key, unless a reproducible build lets it publish yours.

| Path                                        | What                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `fdroid/com.dolphinslabs.trimixblender.yml` | The recipe to submit to `fdroiddata` (`metadata/<app id>.yml` there)                                |
| `tools/test-fdroid-build.sh`                | Lints and builds the recipe with F-Droid's tools in its build server image                          |
| `scripts/android-version.js`                | `npm version`: the version in `android/app/build.gradle` (where F-Droid reads it) and in the recipe |

**The listing.** F-Droid reads it from the sources at the tag, in `fastlane/metadata/android/<locale>/`: Google
Play's texts, screenshots and release notes (`changelogs/<versionCode>.txt`), from `fastlane/listings.json` and
`fastlane/changelog.json` (above).

**The recipe.** Node.js (the version of CI and the Docker build, its checksum checked) is installed by the `sudo`
commands. F-Droid's source scanner runs next, on the sources as committed; then `npm ci` and `npm run build:native`
(the `build` commands), then Gradle (`assembleRelease`, unsigned). npm installs the build tools' native binaries
(esbuild, Rolldown), which the scanner would reject: they come after it, as F-Droid's reviewers accept for npm
builds of a web app. `UpdateCheckMode: Tags` with `AutoUpdateMode: Version`: once the app is in, F-Droid finds each new
tag `v1.2.3`, reads versionName and versionCode in `android/app/build.gradle` at that tag, and adds the build by itself.
That is why the version is written there, by `npm version`, instead of being computed from the tag.

**Test it.** `tools/test-fdroid-build.sh` (Docker, 10 to 20 minutes, the image is 11 GB) runs fdroiddata's own CI
build job: `fdroid lint` and `fdroid rewritemeta` on the recipe, `fdroid checkupdates` (it must find the version in a
tag), then `fdroid build --on-server` of the current commit, or of the working tree when it has uncommitted changes,
and `tools/check-android-apk.sh` on the APK. The APK and the logs land in `fdroid-build/`. CI runs it on every push
(job "F-Droid build"), and a release needs it to pass.

**Submit it** (once):

1. Release a version with `npm version` (the recipe's first build must be a tag whose `build.gradle` holds its version:
   v0.0.4 does not). `npm version` also sets the recipe's build (`versionName`, `versionCode`, `commit: v<version>`)
   and `CurrentVersion` / `CurrentVersionCode`, in the tagged commit: the recipe is then ready to submit as it is.
2. Check that the screenshots (`fastlane/metadata/android/<locale>/images/*Screenshots/`) are committed, as files, not
   links (`cp -rL`: the 10" ones link to the iPad's): F-Droid shows only what is in the repository at the tag. The
   release notes (`changelogs/<versionCode>.txt`) are next to them.
3. Fork <https://gitlab.com/fdroid/fdroiddata>, copy the recipe to `metadata/com.dolphinslabs.trimixblender.yml`, and
   open a merge request with the "App inclusion" template. Its CI runs the same jobs as the script; a reviewer may ask
   for changes. Expect a few weeks.

Afterwards, nothing to do for an update: tag with `npm version`, and F-Droid builds and publishes it, usually within a
week. A merge request to `fdroiddata` is needed only when the build changes (another Node.js version in the recipe,
other build commands). Keep the recipe here in step with the one in `fdroiddata`, so that CI keeps testing it.

**Your signature on F-Droid (optional).** If F-Droid's APK is the same as the one on the GitHub release apart from the
signature (a reproducible build), F-Droid can publish yours: add `Binaries:` (the release APK's URL, with `%v` for the
version) and `AllowedAPKSigningKeys:` (your certificate's SHA-256) to the recipe. Users can then move between the
GitHub and F-Droid versions without uninstalling. Not set up yet: first check that the two APKs match, with
`apksigcopier compare` on the release's APK and the one from `tools/test-fdroid-build.sh` built at its tag.
