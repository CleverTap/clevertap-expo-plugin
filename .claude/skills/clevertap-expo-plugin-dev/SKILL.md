---
name: clevertap-expo-plugin-dev
description: Guides development of the CleverTap Expo config plugin (@clevertap/clevertap-expo-plugin) — adding new features, modifying Android/iOS native config, debugging prebuild issues, and reviewing changes. Covers the plugin's modifier chain, MetadataConfig pattern, gradle property system, iOS extension creation, and native Kotlin lifecycle code. Use when adding features, fixing bugs, reviewing PRs, or modifying any file in this codebase.
---

# CleverTap Expo Plugin — Development Guide

## Additional Resources

- [android-reference.md](android-reference.md) — Android modifier patterns: manifest MetadataConfig, gradle, resources, file copy, dependency templates
- [ios-reference.md](ios-reference.md) — iOS modifier patterns: plist, AppDelegate, Podfile, Xcode project, NSE/NCE extensions
- [config-reference.md](config-reference.md) — Full configuration schema, type definitions, and how to add new config options
- [Expo SDK Upgrade Skill](../expo-sdk-upgrade/SKILL.md) — Workflow for upgrading the plugin when a new Expo SDK or clevertap-react-native version is released. Includes version catalog diffing methodology and detailed migration plan output format.

---

## I. Architecture

### Entry Point

```
app.plugin.js → build/src/withClevertap.js (compiled from src/withClevertap.ts)
```

### Modifier Chain

```
withClevertap(config, props)
├── withCleverTapAndroid(config, props)            [src/withCleverTapAndroid.ts]
│   ├── withHuaweiConfig                           (copies agconnect-services.json if HMS enabled)
│   ├── withCustomNotificationSound                (copies sound file(s) to res/raw)
│   ├── withCleverTapAndroidResources              (writes strings.xml: logLevel, lifecycle, pushTemplates)
│   ├── withCleverTapAndroidManifest               (metadata via MetadataConfig[], services, permissions)
│   ├── withClevertapAndroidAppBuildGradle         (app/build.gradle deps + gradle.properties)
│   └── withCleverTapRootGradlePlugin
│       ├── withCleverTapSettingsGradle            (Huawei Maven repo in settings.gradle)
│       └── withCleverTapRootGradle                (root build.gradle classpaths + HMS repos)
│
└── withCleverTapIos(config, props)                [src/withClevertapIos.ts]
    ├── withCleverTapInfoPlist                     (credentials, background modes)
    ├── withCleverTapBridgingHeader                (ObjC bridging header)
    ├── withCleverTapNotificationServiceExtension  (NSE: files + Xcode target, if enabled)
    ├── withCleverTapNotificationContentExtension  (NCE: files + Xcode target, if enabled)
    └── withCleverTapPodfile                       (clevertap-react-native pod + extension pods)
```

### Expo Config Plugin APIs Used

| API | Safe? | Used for |
|-----|-------|---------|
| `withAndroidManifest` | Yes | Metadata, FCM service, CTNotificationIntentService, permissions |
| `withStringsXml` | Yes | logLevel, lifecycle callbacks, push templates flag |
| `withAppBuildGradle` | Yes | Dependencies via `mergeContents` |
| `withGradleProperties` | Yes | Feature flags and dependency versions |
| `withProjectBuildGradle` | Yes | Root classpaths and HMS repos |
| `withSettingsGradle` | Yes | Huawei Maven repository |
| `withInfoPlist` | Yes | CleverTap credentials, UIBackgroundModes |
| `withXcodeProject` | Yes | NSE and NCE target creation |
| `withDangerousMod` | **No** | Podfile text manipulation, file copy operations |

---

## II. File Organization

```
src/
├── withClevertap.ts                         # Root plugin — validates props, chains Android + iOS
├── withCleverTapAndroid.ts                  # Android orchestrator
├── withClevertapIos.ts                      # iOS orchestrator
│
├── android_config/
│   ├── gradle/
│   │   ├── withClevertapAndroidAppBuildGradle.ts    # app/build.gradle + gradle.properties
│   │   └── withCleverTapAndroidAppRootBuildGradle.ts # root build.gradle + settings.gradle
│   ├── manifest/
│   │   └── withCleverTapAndroidManifest.ts          # AndroidManifest.xml (MetadataConfig pattern)
│   ├── res/
│   │   └── withCleverTapAndroidResources.ts         # strings.xml (logLevel, lifecycle, pushTemplates)
│   ├── io/
│   │   └── withCleverTapAndroidCopyFiles.ts         # HMS config + custom sounds
│   └── utility/
│       ├── androidAppDepsTemplate.ts                # Gradle dependency template generator
│       ├── constants.ts                             # Gradle property keys + default versions
│       └── utils.ts                                 # Gradle property creation helpers
│
└── iOS_config/
    ├── FileManager.ts                               # Async file read/write/copy
    ├── IOSConstants.ts                              # iOS target names, podfile snippets, regex
    ├── NSUpdaterManager.ts                          # Updates bundle versions in extension plists
    ├── withCleverTapBridgingHeader.ts               # Adds ObjC bridging header
    ├── withCleverTapInfoPlist.ts                    # Info.plist modifier
    ├── withCleverTapNotificationContentExtension.ts # NCE Xcode target + file copy
    ├── withCleverTapNotificationServiceExtension.ts # NSE Xcode target + file copy
    └── withCleverTapPodfile.ts                      # Podfile modifications

types/
├── types.ts              # CleverTapPluginProps (root config type)
├── androidTypes.ts       # Android, Features, Dependencies interfaces
└── iOSTypes.ts           # iOS interface

support/
└── CleverTapLog.ts       # Logging: CleverTapLog.log() / .error()

android/src/main/java/expo/modules/adapters/clevertap/
├── CleverTapPackage.kt                              # Expo Package — registers lifecycle listeners
├── CleverTapReactApplicationLifecycleListener.kt   # App onCreate: SDK init, push templates
├── CleverTapReactActivityLifecycleListener.kt      # Activity lifecycle: notification dismiss
└── NotificationUtils.kt                            # Notification dismiss helper (Android 12+)

CTExample/                                          # Example app (replaces example/)
├── app.json                                        # Plugin config with all options
└── App.tsx
```

---

## III. Key Patterns

### MetadataConfig Pattern (Android Manifest)

All manifest metadata is managed via a declarative `MetadataConfig[]` array. Each entry defines:
- `key` — Android metadata key
- `getValue(props, config)` — returns value string or `undefined` (undefined = remove)
- `onAdd(props, manifest)` — optional: add permissions, etc. when value is set
- `onRemove(manifest)` — optional: clean up permissions when value is removed

**This is bidirectional** — entries are removed from the manifest when a feature is disabled, unlike a simple append approach.

To add a new metadata entry, add to `METADATA_CONFIGS` in `src/android_config/manifest/withCleverTapAndroidManifest.ts`.

### strings.xml Resources Pattern

`withCleverTapAndroidResources.ts` uses `withStringsXml` to write Android resource strings read by the native Kotlin module at runtime. Currently manages:
- `expo_clevertap_register_activity_lifecycle_callbacks`
- `expo_clevertap_enable_push_templates`
- `expo_clevertap_log_level`

The Kotlin module reads these from `R.bool` and `R.integer` at `Application.onCreate()`.

### Gradle Properties System

Feature flags and dependency versions are written to `gradle.properties`. At Gradle build time, dependencies conditionally include themselves based on `project.hasProperty()` checks. This avoids complex Gradle string manipulation for optional dependencies.

---

## IV. How to Add a New Android Feature Flag

Example: adding `enableGeofence`.

### 1. `types/androidTypes.ts` → `Features`
```typescript
enableGeofence?: boolean;
```
If it needs a version: add to `Dependencies` too.

### 2. `src/android_config/utility/constants.ts`
```typescript
GEOFENCE_ENABLED: 'clevertapGeofenceEnabled',
GEOFENCE_VERSION: 'geofenceVersion',
```
Add default version to `CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS`.

### 3. `src/android_config/utility/utils.ts` → `createFeatureProperties`
```typescript
createGradleProperty(KEYS.GEOFENCE_ENABLED, String(features.enableGeofence)),
```

### 4. `src/android_config/utility/androidAppDepsTemplate.ts`
Add `generateGeofenceDependencies()` and include in `generateDependenciesTemplate()`.

### 5. `src/android_config/gradle/withClevertapAndroidAppBuildGradle.ts`
Add `enableGeofence = false` to destructured features.

### 6. `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts`
Add `enableGeofence = false` to destructured features in `withCleverTapRootGradlePlugin`.

### 7. `src/android_config/manifest/withCleverTapAndroidManifest.ts` (if needs manifest entry)
Add to `METADATA_CONFIGS`:
```typescript
{
    key: 'CLEVERTAP_GEOFENCE',
    getValue: (props) => props.android?.features?.enableGeofence ? "1" : undefined
}
```

### 8. `CTExample/app.json` — add to plugin config for testing.

---

## V. How to Add a New Root Config Option

Root config options affect both platforms or are cross-cutting (like `proxyDomain`, `encryptionLevel`).

1. Add to `CleverTapPluginProps` in `types/types.ts`
2. For Android manifest: add to `METADATA_CONFIGS` in `withCleverTapAndroidManifest.ts`
3. For iOS: add to appropriate iOS modifier
4. For strings.xml: add to `withCleverTapAndroidResources.ts` if it needs to be read at runtime by native Kotlin code

---

## VI. Native Kotlin Module (android/)

- **`CleverTapPackage`** — implements Expo's `Package` interface; registers both lifecycle listeners
- **`CleverTapReactApplicationLifecycleListener`** — runs in `Application.onCreate()`:
  - Reads `R.bool.expo_clevertap_register_activity_lifecycle_callbacks` → registers `ActivityLifecycleCallback`
  - Reads `R.integer.expo_clevertap_log_level` → sets CleverTap debug level
  - Reads `R.bool.expo_clevertap_enable_push_templates` → sets `PushTemplateNotificationHandler`
  - Calls `CleverTapRnAPI.initReactNativeIntegration(application)`
- **`CleverTapReactActivityLifecycleListener`** — handles Android 12+ notification dismissal, push template notification cancellation (rating, product_display)
- **`NotificationUtils`** — singleton for notification dismiss logic

Resources (strings.xml values) are written by `withCleverTapAndroidResources` at prebuild time and read by the Kotlin module at runtime.

---

## VII. Testing Workflow

```bash
# Build plugin
npm run build

# Test with example app
cd CTExample
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

After `expo prebuild`, verify:
- `CTExample/android/app/src/main/AndroidManifest.xml` — metadata, services
- `CTExample/android/app/build.gradle` — dependencies
- `CTExample/android/gradle.properties` — feature flags + versions
- `CTExample/android/app/src/main/res/values/strings.xml` — logLevel, lifecycle, pushTemplates
- `CTExample/ios/Podfile` — pods
- `CTExample/ios/<AppName>/Info.plist` — credentials

---

## VIII. Code Conventions

- **Logging**: always `CleverTapLog.log()` / `.error()` — never raw `console.log`
- **Manifest metadata**: use the `MetadataConfig` array pattern — never add raw if/else blocks
- **Feature flags**: boolean → `gradle.properties` → Gradle conditional → runtime dependency
- **Gradle modifications**: use `mergeContents` with tagged blocks for idempotency
- **Naming**: use `CleverTap` (uppercase T) for new files; existing inconsistency (`withClevertap`) is kept for backward compat in public filenames

---

## IX. Common Pitfalls

1. **strings.xml is the bridge to native** — `withCleverTapAndroidResources` must be called for any config value read by the Kotlin module at runtime
2. **MetadataConfig removes on disable** — unlike the old approach, disabling a feature removes its manifest entry; test both enable and disable cases
3. **Gradle classpath is only added when feature is enabled** — `google-services` classpath is only added when `enablePush=true`, not unconditionally
4. **`withDangerousMod` ordering** — runs after safe mods; Podfile is written last
5. **Build before test** — plugin runs from `build/`; always `npm run build` before `expo prebuild`
6. **`customNotificationSound` accepts `string | string[]`** — handle both cases in copy logic
