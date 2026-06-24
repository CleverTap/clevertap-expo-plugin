---
name: integration-step-analysis
description: How to detect whether a new CleverTap native SDK release (Android core / push-templates / HMS, or the iOS SDK / notification extensions) ADDED, CHANGED, or REMOVED a native integration step that the Expo config plugin must reflect — a new permission, Maven repo, gradle dependency, manifest entry, pod, entitlement, or app.json field. Self-discovering — it derives the plugin's current integration steps from the plugin's own code, then reconciles against the SDK docs. Use during a release sync after version propagation.
---

# Integration-step analysis (the judgment ~1%)

Version numbers are mechanical (see `native-version-sync`). The harder question is:
**did this release change the native SETUP the plugin has to perform?** A new
permission, a new Maven repo, a new pod, a new manifest entry, a new entitlement.
This skill is the method for answering that safely. The rule throughout:
**confirm-or-flag, never guess.** A flagged gap is recoverable in review; a wrongly
added/removed integration step is a broken build or a silently broken feature.

## Step 1 — Derive the plugin's CURRENT integration steps from its own code

Do NOT work from a hardcoded list (it rots). Build the inventory by reading the
plugin (use the `clevertap-expo-plugin-dev` skill for the map). Enumerate, per area:

**Android**
- Manifest metadata + permissions: `src/android_config/manifest/withCleverTapAndroidManifest.ts` (`METADATA_CONFIGS` — each entry's `key`, `getValue`, `onAdd` permissions).
- `strings.xml` runtime values: `src/android_config/res/withCleverTapAndroidResources.ts`.
- App `build.gradle` dependencies (per feature): `src/android_config/utility/androidAppDepsTemplate.ts` (the `generate*Dependencies` functions and their Maven coordinates).
- Root gradle classpaths + Maven repos (incl. the Huawei AGConnect repo): `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts`; settings repos in the same area.
- File copies (HMS `agconnect-services.json`, custom sounds, notification icon): `src/android_config/io/withCleverTapAndroidCopyFiles.ts`.
- Native Kotlin lifecycle (init, push templates, notification dismissal): `android/src/main/java/expo/modules/adapters/clevertap/`.

**iOS**
- Info.plist keys, background modes: `src/iOS_config/withCleverTapInfoPlist.ts`.
- Podfile pods (main + NSE/NCE extension pods): `src/iOS_config/withCleverTapPodfile.ts` + `IOSConstants.ts`.
- NSE / NCE Xcode targets, entitlements, app groups, deployment target: `withCleverTapNotificationServiceExtension.ts`, `withCleverTapNotificationContentExtension.ts`, `IOSConstants.ts`.

## Step 2 — Reconcile against authoritative sources (per SDK)

For each SDK in scope (CleverTap Android **core**, **push-templates**, **HMS**, and
the **iOS** SDK + its notification extensions), read what its setup requires at the
new version and compare to the inventory. Three authoritative sources (use WebFetch,
restricted to `raw.githubusercontent.com`, `github.com`, `developer.clevertap.com`,
`reactnative.dev`, `expo.dev`):

1. The native SDK's **install / integration docs** on GitHub (README, docs/).
2. The **CleverTap docs site** integration pages (Android, iOS, push, HMS, push-templates).
3. The **changelogs** already in `expo-diff.json` (RN + Android core/pt/hms) — they
   often announce "you must now add …".

Also consult `expo-diff.json` `android_dependency_diff.core`: a NEW `compileOnly`
dependency in core is the clearest machine-detectable integration step.

## Step 3 — Decide per candidate change

- **New step required** (e.g. a new permission, a new Maven repo, a new pod, a new
  `compileOnly` dep, a new manifest metadata key): add it via the right modifier.
  Follow `clevertap-expo-plugin-dev` for the exact pattern (MetadataConfig entry,
  a `generate*Dependencies` function + `constants.ts` key + `types/androidTypes.ts`
  field for a new dep, a Podfile snippet for a new pod, etc.). Record an
  `integration_steps_changed` entry with `source_verified: true` and the source.
- **Step changed** (e.g. a permission renamed, a repo URL changed): update it; record it.
- **Step removed** (the SDK no longer needs it): remove the modifier/entry
  (the MetadataConfig pattern is bidirectional — disabling removes it). Record it.
- **Cannot confirm / ambiguous / needs design judgment**: do NOT change anything.
  Add it to `flagged_for_review` with what the source claimed and where you looked.

## Step 4 — Source-verify before writing

Before adding a Maven coordinate, permission, repo, pod, or entitlement, confirm it
exists / is required at the new version:
- Maven coordinates / SDK requirements → the cached native SDK source the fact-finder
  downloaded (under `~/.cache/clevertap-sdk-versions/`), read with the **Read / Grep /
  Glob tools** (NOT Bash — Bash paths outside the working dir are denied).
- Setup procedure → the SDK/CleverTap docs via WebFetch (advisory; for *whether* a
  step is needed, never for version numbers).

If you cannot confirm it in an authoritative source, flag it — do not add it.

## Per-SDK reminders (so none is forgotten)

- **core** — most integration steps live here (permissions, metadata, the core deps).
- **push-templates** — gated behind `enablePushTemplates` (which needs `enablePush`);
  its compileOnly pin is in `android/build.gradle`.
- **HMS** — Android-only; brings the AGConnect Maven repo + `agcp` classpath + the
  `agconnect-services.json` file copy. A new HMS requirement touches all three.
- **iOS core** — version floats via clevertap-react-native; the plugin's iOS steps are
  Info.plist keys, the bridging header, and the Podfile main pod.
- **NSE / NCE** — the iOS notification extensions: their pods, target files,
  entitlements, app groups, and deployment target. A new extension capability is an
  integration step here.
