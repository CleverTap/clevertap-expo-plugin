# Wrapper-Sync Automation — CleverTap Expo Plugin (Handoff)

> Status: **validated end-to-end on a fork (2026-06-23).** Owner: @piyush-kukadiya.
> This doc is the "where is the Expo wrapper-sync right now" reference for a fresh
> Claude session or a new developer. Built on hub branch `task/expo-wrapper-sync`
> (pending production cutover — see the last section).

## What this is

A "robot" that keeps `@clevertap/clevertap-expo-plugin` up to date when a new
`clevertap-react-native` release and/or a new Expo SDK version ships. A maintainer
clicks **Actions → native-release-sync → Run workflow**, types the target
`clevertap_rn_version` and `expo_sdk_version`, and a headless Claude run (in the
central tooling repo) bumps versions, propagates native-integration-step changes,
showcases any new clevertap-react-native APIs in the example app, updates the
compatibility matrix + CHANGELOG, compiles CTExample, and opens a PR for review.

The robot does the mechanical ~99%; genuine judgment (~1%) is left as
`flagged_for_review` notes in the PR for a human to settle at merge.

## Why Expo is different from the other wrappers

The React Native / Flutter / Cordova wrappers are native bridges — their sync
surfaces new SDK *methods*. **The Expo plugin is a config plugin: it surfaces NO
methods.** It pins dependency versions and generates native setup (manifest,
gradle, Podfile, iOS extensions) during `expo prebuild`. So the Expo sync is
**version + build-config + native-integration-step propagation**, driven by the
clevertap-react-native + Expo SDK versions (the required native Android/iOS SDK
versions are auto-resolved from the clevertap-react-native release). iOS native
SDK versions are intentionally UNPINNED here — they float transitively from
clevertap-react-native's podspec (only the iOS deployment target is propagated).

New `clevertap-react-native` JS APIs are exposed by that package directly, not by
the plugin — but the sync *does* add runnable demo buttons for them in CTExample
(a JS-only showcase), so the example stays current. See "What the robot does."

## The two repos

1. **This repo (`clevertap-expo-plugin`)** holds the thin dispatch workflow
   (`.github/workflows/native-release-sync.yml`), `CODEOWNERS`, the domain skills
   under `.claude/skills/`, and the plugin + CTExample that the robot edits.
2. **`CleverTap/clevertap-wrapper-tooling`** (the hub) holds all the reusable CI
   machinery: the reusable `sync.yml` conductor, composite actions, the Expo
   orchestrator prompt (`prompts/sync-orchestrator-expo.md`), the PR-body prompt
   (`prompts/pr-description-expo.md`), the fact-finder (`tools/expo_diff.py`), and
   the build composite (`.github/actions/build/expo`).

`uses:` pins `@v1` (a moving tag). Note `uses:` does NOT follow org redirects.

## What the robot does (the sync steps)

Driven by `prompts/sync-orchestrator-expo.md` + the five `.claude/skills`:
1. Run `expo_diff.py` (ground truth for all version numbers).
2. Resolve the chain (RN target → required Android core / iOS core / push-templates / HMS).
3. Apply version bumps (only HIGH-confidence coordinate matches; flag the rest).
4. Classpaths (only consumer-facing, confirmed; never AGP).
5. New/removed `compileOnly` deps → dep-template + types + constants.
6. Integration-step reconciliation (native docs + CleverTap docs + RN changelog).
7. Expo SDK analysis (config-plugin API changes, app.json schema, compileSdk/deployment shifts).
8. iOS deployment-target propagation (`IOSConstants.ts` + podspec) if it rose.
9. Update CTExample (`app.json`, `package.json`).
9b. **Showcase new clevertap-react-native APIs** as demo buttons in CTExample
   (`constants.js` + `App.js` [+ `app-utils.js`]) — source-verified against the RN
   repo at the target tag; recorded in `apis_demoed`.
10. README compat-matrix row + CHANGELOG entry + plugin semver bump.

## The Expo-specific pieces in the hub

- `tools/expo_diff.py` — deterministic fact-finder. Resolves the RN→native chain,
  diffs the Android version catalog (tomllib) + dependency blocks, diffs the iOS
  podspec, **discovers** the plugin's pins by parsing `constants.ts` +
  `androidAppDepsTemplate.ts` and matching to the catalog **by Maven coordinate**
  (so `play-services-ads-identifier` is correctly NOT confused with the catalog's
  `play-services-ads`), and extracts **full changelogs (target + intermediates)**
  for clevertap-react-native, Android core (+ pt/hms), and **iOS core**. Fails loud
  on uncertainty; never invents a version.
- `prompts/sync-orchestrator-expo.md` — single combined sync (both platforms in
  one pass). Auto-applies only HIGH-confidence coordinate matches; flags the rest.
- `.github/actions/build/expo/action.yml` — selects latest Xcode, yalc-links the
  plugin into CTExample, writes valid CI service stubs + normalizes account values,
  runs `expo prebuild`, COMPILE-ONLY builds Android (`gradlew assembleDebug`) + iOS
  (`xcodebuild build`), then **restores CI-mutated files + removes yalc artifacts**
  so the commit contains only real source edits. No emulator/simulator boot.
- `prompts/pr-description-expo.md` — renders the Expo PR body, incl. a **collapsible
  full-changelog** reviewer section (RN/Android/iOS target+intermediates; Expo as links).

## Files the robot edits each run

`src/android_config/utility/constants.ts` (version pins),
`src/android_config/utility/androidAppDepsTemplate.ts` (+ `types/androidTypes.ts`,
for new compileOnly deps), `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts`
(classpaths), `android/build.gradle` (push-templates pin),
`src/iOS_config/IOSConstants.ts` + `ios/ExpoAdapterCleverTap.podspec` (iOS
deployment target), `CTExample/{app.json,package.json}` and
`CTExample/{constants.js,App.js,app-utils.js}` (new-API demos), `README.md` (compat
matrix), `CHANGELOG.md`, `package.json` (plugin version).

## Runner / timing

- Runs on **`macos-15`** (the Expo dispatch passes `runs_on: macos-15`) — Expo
  SDK 55+/RN 0.83+ need a newer Xcode/Swift (e.g. Xcode 26.x) than `macos-14` has,
  to build `expo-modules-core`. `latest-stable` Xcode is selected in the build.
- Job timeout is **180 min** — Expo does TWO full compiles (pre- + post-sync) plus
  the Claude run; iOS `xcodebuild` alone is ~30 min each.

## Required repo secrets

`CLEVERTAP_WRAPPER_SYNC_APP_ID`, `CLEVERTAP_WRAPPER_SYNC_PRIVATE_KEY`,
`ANTHROPIC_API_KEY` (same `clevertap-wrapper-sync` App as the other wrappers).
`SLACK_WEBHOOK_URL` is optional. The App needs **Contents: write** +
**Pull requests: write**.

## Testing (fork-based — see the hub's TESTING.md)

1. Fork this repo. Put the dispatch workflow + skills on a branch (e.g.
   `task/setup-sync-automation`) and set it as the fork's default branch so the Run
   button appears. The skills must live on the `base_ref` branch the sync checks out.
2. Install the App on the fork + add the secrets.
3. First run with `skip_sync=true` ($0 — validates setup + build/expo).
4. Then a real run (`skip_sync=false`); the robot auto-creates `task/release_<name>`
   from `base_ref` and opens a PR back against it. Use a unique `release_name`.
   For testing the hub itself, pass `tooling_ref: <hub-branch>` so the hub's
   composite actions/prompts/tools come from that branch (not the default).
5. Iterate the hub via the moving `@v1` tag, or via `tooling_ref` for a branch.

## Known traps (all handled in the implementation)

- **PR never opens:** `sync.yml`'s commit/push/PR conditions must include
  `sync_expo.outcome` — Expo's `sync_android`/`sync_ios` steps are skipped.
- **Tooling checkout ref:** the conductor checks out the hub at `inputs.tooling_ref
  || github.job_workflow_sha` (the latter is empty for `workflow_dispatch` reusable
  calls — hence the explicit `tooling_ref` override for testing).
- **macOS/Xcode:** Expo 55+/RN 0.83+ iOS won't build on macos-14 (Swift 6 errors in
  expo-modules-core) — use macos-15 + latest Xcode.
- **App-token TTL:** the setup token (1 hr) expires during the ~90-min run, so a
  FRESH token is minted right before push/PR, with explicit
  `permission-contents:write` + `permission-pull-requests:write`; the push also
  clears `actions/checkout`'s stale `http.extraheader` before re-auth.
- **Clean PR:** build/expo backs up + restores CI-mutated files (`app.json`,
  `google-services.json`, `agconnect-services.json`) and removes `.yalc`/`yalc.lock`
  so they don't pollute the commit; CTExample account placeholders ("YOUR ACCT ID",
  which contain spaces) are normalized to space-free CI values so the iOS pbxproj parses.
- **Tags / branches:** `expo_diff.py` resolves combined Android tags (e.g.
  `corev7.6.0_ptv2.2.0`) via the GitHub tags API; `GITHUB_TOKEN` is passed to avoid
  the anon rate limit. The clevertap-react-native / android-sdk default branch is
  `master`, not `main`. RN tags are bare `X.Y.Z`.
- **Versions come ONLY from `expo_diff.json`;** WebFetch (Expo-only) is for reading
  integration-step docs + Expo notes, never for version numbers.

## Production cutover (remaining)

1. In the spoke dispatch, flip `uses:` `@task/expo-wrapper-sync` → **`@v1`**; remove
   the test-only `tooling_ref`; **keep `runs_on: macos-15`**.
2. PR this branch (dispatch workflow + `.claude/skills`) → the real
   `CleverTap/clevertap-expo-plugin` `develop`.
3. Merge the hub branch `task/expo-wrapper-sync` to the hub default branch and move
   the `v1` tag.
4. Install the App + add the secrets on the real `clevertap-expo-plugin`.
