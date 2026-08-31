---
name: native-version-sync
description: How to propagate CleverTap native SDK version bumps into the Expo plugin for ALL SDKs (Android core / push-templates / HMS, the AndroidX & third-party deps, and the iOS deployment target) using the expo_diff.py fact-finder. Self-discovering — it reads the plugin's own pins at runtime and matches them to the SDK version catalog by Maven coordinate; it hardcodes no version numbers. Use during a release sync to bump dependency versions safely.
---

# Native version sync (the mechanical core)

This skill covers **version propagation** — bumping the dependency versions the
plugin pins when a new `clevertap-react-native` release ships. It is deliberately
**data-driven**: every version, dependency, and mapping is discovered at run time
from the plugin's own files and the SDK's version catalog. Do NOT hardcode version
numbers or a key→catalog mapping table — they rot. Discover them every time.

## The ground truth: expo_diff.py

The deterministic fact-finder (`tools/expo_diff.py` in the tooling repo, passed as
`${DIFF_TOOL_PATH}`) does the exact, boring work and writes `expo-diff.json`. Run it:

```bash
python3 ${DIFF_TOOL_PATH} --rn-version <target> --expo-sdk-version <target> --plugin-path .
```

It produces (read the JSON, do not re-derive):

- `chain` / `meta.resolved` — what the target clevertap-react-native release
  requires: CleverTap Android core, iOS core, push-templates, HMS versions. **The
  Android core target is authoritative from the RN release**, not from the catalog.
- `android_catalog_diff.versions` — every `[versions]` entry that changed between
  the plugin's current core and the target core (parsed with a real TOML parser).
- `android_dependency_diff.core` — added/removed/changed `compileOnly` vs
  `implementation` deps in `clevertap-core/build.gradle` (compileOnly = host must
  provide → plugin change; implementation = transitive → no change).
- `ios_diff` — iOS deployment-target / podspec dependency changes.
- `discovery` — the heart: the plugin's own pins matched to the catalog **by Maven
  coordinate** (see below): `mapped`, `plugin_only`, `catalog_only`, `classpaths`,
  `ios_deployment_target`.
- `meta.warnings` / `meta.discovered_pin_count` — the trust signals (see Reliability).

## Why coordinate matching (and the play-services trap)

The fact-finder matches a plugin pin to a catalog version **by the actual Maven
coordinate** (`group:artifact`), read from the plugin's own
`androidAppDepsTemplate.ts`, NOT by fuzzy key name. This is critical:

- The plugin's Google-Ad-ID pin uses the artifact `com.google.android.gms:play-services-ads-identifier`.
- The SDK catalog's `play_services_ads` key is the DIFFERENT artifact `com.google.android.gms:play-services-ads`.

A name-based match would wrongly equate them and bump to the wrong version. The
coordinate match correctly leaves it in `plugin_only` (flagged, never auto-synced).
Trust this: only act on coordinate matches the tool reports as `high` confidence.

## What the plugin pins, and where (discover, don't assume)

Read these to confirm the current state (the fact-finder already parsed them, but
re-verify each value before you write it):

| What | File | How it's stored |
|------|------|-----------------|
| CleverTap core + AndroidX/third-party dep versions | `src/android_config/utility/constants.ts` | `CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS` (nested groups of `key: 'version'`) |
| Push-templates pin (module compileOnly) | `android/build.gradle` | `compileOnly("com.clevertap.android:push-templates:X")` |
| Google-Services / HMS (AGConnect) classpaths | `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts` | `GOOGLE_SERVICES_CLASSPATH` / `HMS_CLASSPATH` string literals |
| iOS deployment target | `src/iOS_config/IOSConstants.ts` | `DEPLOYMENT_TARGET = "11.0"` |
| iOS native SDK versions | (not pinned) | float transitively via clevertap-react-native's podspec — do NOT add a version |

The coordinate→version-key wiring lives in `androidAppDepsTemplate.ts` (each
`getVersionProperty(KEYS.X)` maps a `KEYS` constant to a version key in
`constants.ts`). That's why the fact-finder can discover the mapping itself.

## How to apply (auto-apply only HIGH confidence)

1. For each `discovery.mapped` row with `"changed": true` and `"confidence": "high"`:
   re-verify `plugin_current` against `constants.ts` and `catalog_target` against the
   fetched catalog, then update the `plugin_key` in `constants.ts`. If push-templates
   changed, also update the `compileOnly` pin in `android/build.gradle`.
2. Every `discovery.plugin_only` row, and anything not `high` confidence → do NOT
   change it; add it to `flagged_for_review`. These are plugin-managed artifacts that
   differ from the catalog. A flagged item is recoverable; a wrong bump is a broken
   build or a silently-wrong release.
3. Classpaths (`discovery.classpaths`): change `GOOGLE_SERVICES_CLASSPATH` /
   `HMS_CLASSPATH` only on a confirmed consumer-facing change. NEVER touch AGP — it's
   read dynamically from React Native at prebuild time.
4. iOS deployment target: only bump `IOSConstants.ts` `DEPLOYMENT_TARGET` (and
   `ios/ExpoAdapterCleverTap.podspec` `:ios => '...'`) if `ios_diff.deployment_target`
   shows an increase above the current value. Do NOT pin the iOS SDK version anywhere.
5. New / removed `compileOnly` deps in `android_dependency_diff.core` are an
   *integration step* change — hand off to the `integration-step-analysis` skill
   (they need a generator in `androidAppDepsTemplate.ts` + a key in `constants.ts` +
   a field in `types/androidTypes.ts`).

## Reliability — the fact-finder is the first source, not the only source

- Treat `expo-diff.json` as ground truth for version NUMBERS only. Confirm each
  number you write against the plugin file + the fetched catalog (the tool dumps raw
  fetched files under the cache for inspection).
- If `meta.warnings` is non-empty, or `meta.discovered_pin_count` looks wrong (it
  should be ~16), the discovery is suspect — verify by hand or flag, don't bulk-apply.
- Versions NEVER come from a docs page or changelog prose — only from the fact-finder.
