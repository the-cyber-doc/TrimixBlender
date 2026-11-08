# Publishing in the stores

How to publish Trimix Blender on Google Play and the Apple App Store, in all its languages, and where else it can go.
The signed apps come from CI: a `v*.*.*` tag attaches the APK, the AAB and, if the optional iOS job succeeded, the IPA
to the GitHub release (README, Signing).

> Store rules, fees and limits change. Everything below was checked in November 2026; if a console disagrees, the
> console is right.

## What is in the repository

| Path                                              | What                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `fastlane/metadata/android/<locale>/`             | Google Play listing: `title.txt`, `short_description.txt`, `full_description.txt`                              |
| `fastlane/metadata/android/en-US/images/icon.png` | The 512 × 512 store icon                                                                                       |
| `fastlane/metadata/ios/<locale>/`                 | App Store listing: `name.txt`, `subtitle.txt`, `description.txt`, `keywords.txt`, `promotional_text.txt`, URLs |
| `fastlane/metadata/ios/*.txt`                     | App Store, all languages: copyright, categories (Sports, Utilities)                                            |
| `PRIVACY.md`                                      | The privacy policy both stores require (its GitHub URL is in the listings)                                     |
| `npm run screenshots`                             | Generates the screenshots (not committed, see below)                                                           |

The listings exist in 8 languages, with each store's locale code:

| App                | Google Play | App Store |
| ------------------ | ----------- | --------- |
| English (default)  | `en-US`     | `en-US`   |
| French             | `fr-FR`     | `fr-FR`   |
| German             | `de-DE`     | `de-DE`   |
| Spanish            | `es-ES`     | `es-ES`   |
| Italian            | `it-IT`     | `it`      |
| Dutch              | `nl-NL`     | `nl-NL`   |
| Japanese           | `ja-JP`     | `ja`      |
| Simplified Chinese | `zh-CN`     | `zh-Hans` |

**Have every translation checked by a diver who is a native speaker** before publishing, the app's warnings first
(`src/lib/locales/*.ts`), then the listings. They were drafted by an AI.

### Screenshots

`npm run screenshots` builds the app and takes, for each language, each area of the app (Available gases, Target
mix, Mix to do) for a nitrox and a trimix blend: 6 per device and language, 144 in all
(`playwright.screenshots.config.ts`, `tests/screenshots/store.spec.ts`).

| Device                  | Size (px)   | Written to                                                    |
| ----------------------- | ----------- | ------------------------------------------------------------- |
| Android phone           | 1080 × 1920 | `fastlane/metadata/android/<locale>/images/phoneScreenshots/` |
| iPhone 6.9" (App Store) | 1320 × 2868 | `fastlane/screenshots/ios/<locale>/`                          |
| iPad 13" (App Store)    | 2064 × 2752 | `fastlane/screenshots/ios/<locale>/`                          |

These are the sizes the stores require: Google Play takes 2 to 8 phone screenshots per language, each side from 320 to
3840 px and the long side at most twice the short one. The App Store requires the 6.9" iPhone set and, because the app
also runs on iPad, the 13" iPad set; it takes up to 10 per device and language. They are generated, so they are in
`.gitignore` (about 25 MB); run the command again after any visible change.

### Still to make by hand

- **Google Play feature graphic** (required): 1024 × 500 PNG or JPEG, in
  `fastlane/metadata/android/<locale>/images/featureGraphic.png` (one per language if it holds text, else `en-US`
  only).
- **Release notes** for each update: `fastlane/metadata/android/<locale>/changelogs/<versionCode>.txt` (versionCode
  of 1.2.3 is 10203), and `fastlane/metadata/ios/<locale>/release_notes.txt`. Not needed for the first version.

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
short description, full description from `fastlane/metadata/android/<locale>/`, the phone screenshots, and the feature
graphic. Do not use Google's machine translation of the listing: ours is checked and has the right diving terms.

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
npm run screenshots   # the phone screenshots, into fastlane/metadata/android/
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

1. Upload the IPA from the GitHub release (or the run's `ios-app` artifact), on a Mac:
   - **Transporter** (free, Mac App Store): drag the `.ipa`, Deliver.
   - Or `xcrun altool --upload-app -f trimix-blender-1.2.3.ipa -t ios --apiKey <KEY_ID> --apiIssuer <ISSUER_ID>`
     (the CI's API key, in `~/.appstoreconnect/private_keys/AuthKey_<KEY_ID>.p8`).
2. The build appears in **TestFlight** after processing (minutes). Export compliance is already answered in
   `Info.plist` (no encryption besides the system's). Test it yourself (internal testing needs no review).
3. On the version's page, select the build, fill **App Review Information** (contact; no sign-in needed) and submit.
   Review usually takes one to two days.

**Review risk: guideline 4.2, minimum functionality.** Apple rejects apps that are only a website in a wrapper. In the
review notes, say what the app is: a self-contained calculator that works fully offline, its whole code inside the
app, no web content loaded. Mention the real-gas model and the drawings. If rejected, answer in Resolution Center
with the same points before changing anything.

### Upload with fastlane (optional)

`deliver` uploads every language's listing and screenshots through the App Store Connect API (it works on Linux too;
the binary itself is uploaded from a Mac, above). Write the API key as JSON once, outside the repository:

```json
{
	"key_id": "<KEY_ID>",
	"issuer_id": "<ISSUER_ID>",
	"key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

```sh
npm run screenshots   # the iPhone and iPad screenshots, into fastlane/screenshots/ios/
fastlane deliver --api_key_path ~/keys/asc.json --app_identifier com.dolphinslabs.trimixblender \
  --metadata_path fastlane/metadata/ios --screenshots_path fastlane/screenshots/ios \
  --overwrite_screenshots --skip_binary_upload --force
```

`deliver` tells the iPhone and iPad screenshots apart by their size. Add `--submit_for_review` once a build is
selected, or submit from the website.

## 4. Other places

- **GitHub releases**: already done by CI (APK for direct install, the web build, the Docker image).
- **IzzyOnDroid** (<https://apt.izzysoft.de/fdroid/>): an F-Droid repository that takes the signed APK from the GitHub
  releases; ask for inclusion with an issue there. It reads the listing from `fastlane/metadata/android/` (the
  screenshots too, which would then have to be committed).
- **F-Droid** (main repository): builds the app itself from the sources, and signs it with its own key (the same
  update problem as Play, unless a reproducible build lets it publish your signature). More work: a merge request to
  `fdroiddata` with a build recipe (Node and Gradle).
- **Android developer verification**: Google announced that, from 2026 onwards and country by country, apps installed
  on certified Android phones must come from a verified developer, sideloaded ones included. A Play Console account
  is verified; check the current status for the APK published on GitHub.
