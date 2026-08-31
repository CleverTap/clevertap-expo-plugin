---
name: expo-sdk-analysis
description: How to analyze a new Expo SDK release for anything that affects the CleverTap Expo config plugin — @expo/config-plugins API changes, app.json/app.config schema changes, and Android compileSdk/minSdk/AGP or iOS deployment-target default shifts. Covers reading both the expo.dev release notes and the GitHub CHANGELOG, and walking intermediate SDK versions on a multi-version jump. Use during a release sync when the Expo SDK version is changing.
---

# Expo SDK analysis

When the target Expo SDK version differs from what the plugin currently supports,
analyze the Expo release(s) for changes that touch the plugin. The plugin is built
ON the Expo config-plugin API and reads `app.json` fields, so Expo-side changes can
break it even when no CleverTap version moves.

## Sources (read BOTH — they're complementary)

Use WebFetch (allowed for Expo; restricted to the doc hosts). The fact-finder
(`expo_diff.json` → `changelogs.expo`) gives you the exact URLs and marks the Expo
changelog as `webfetch_needed` (it does NOT parse Expo's HTML — that's your job):

1. **Release notes** (human-readable, motivations): `https://expo.dev/changelog/sdk-<version>`
2. **GitHub CHANGELOG** (detailed per-package breaking changes): `https://raw.githubusercontent.com/expo/expo/main/CHANGELOG.md`

**Multi-version jumps:** if upgrading across more than one SDK (e.g. 53 → 56), read
each intermediate version's notes too — breaking changes accumulate.

## What to look for (scan the WHOLE changelog; section names vary by version)

| What | Why it matters to the plugin |
|------|------------------------------|
| `@expo/config-plugins` API changes (new/removed/renamed methods, signature changes) | The plugin calls `withAndroidManifest`, `withStringsXml`, `withAppBuildGradle`, `withGradleProperties`, `withProjectBuildGradle`, `withSettingsGradle`, `withInfoPlist`, `withXcodeProject`, `withDangerousMod`, and `mergeContents`. A breaking change in any of these breaks prebuild. |
| `app.json` / `app.config` schema changes (fields added / deprecated / removed) | The plugin reads config fields. Precedent: SDK 55 **removed `notification.icon`** → the plugin added `android.notificationIcon`. A removed field that the plugin reads must be migrated. |
| Android `compileSdkVersion` / `targetSdkVersion` / `minSdkVersion` default bumps | The plugin relies on Expo's `useDefaultAndroidSdkVersions()`. Usually no change needed, but confirm the CleverTap SDK AAR is compatible with the new level. |
| iOS deployment-target / Xcode version bumps | The NSE/NCE extension targets and `IOSConstants.DEPLOYMENT_TARGET` may need updating. |
| React Native version bump | Note the new RN version for the README compatibility matrix; may change autolinking / build system. |
| New Architecture / Legacy Architecture changes | The plugin's native Kotlin module is discovered via Expo autolinking — confirm it still resolves. |
| `expo-module-scripts` / build-tooling changes | May require bumping the `expo` devDependency (see below). |

Anything unrelated to native build config, manifests, gradle, Xcode, autolinking, or
`app.json` schema is **likely irrelevant** (Expo Router, Expo UI, individual packages
like expo-camera, EAS Update, CLI dev tooling, etc.).

## How to act

- **Confirmed mechanical fix** (e.g. a removed `app.json` field the plugin reads → adopt
  the replacement; a renamed config-plugins method → update the call): apply it, and
  record an `integration_steps_changed` / `build_propagated` entry.
- **Breaking change needing redesign** (e.g. a config-plugins API the plugin depends on
  was removed with no drop-in replacement): do NOT guess a rewrite. Add it to
  `flagged_for_review` (type `expo_breaking`) describing the break and the affected
  modifier — a human handles it.

## The `expo` devDependency vs peerDependency

The `expo` version in the plugin's `package.json` is a **devDependency** (local
build/test only); the plugin declares `"expo": "*"` in `peerDependencies`. Bumping the
devDep is usually NOT required for a new Expo SDK to work. Bump it only if: a new
config-plugins API is needed, an existing API has a breaking type change, or you want
local dev/test to match the target. When unsure, leave it and note it.

## Output

Feed your findings into the sync's `build_propagated`, `integration_steps_changed`, or
`flagged_for_review`, and into the README compatibility-matrix row's
`react_native` column (the RN version that ships with the target Expo SDK — read it
from the Expo release notes).
