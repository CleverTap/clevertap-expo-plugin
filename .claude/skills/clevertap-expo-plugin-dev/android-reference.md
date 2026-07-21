# Android Reference — CleverTap Expo Plugin

## 1. Manifest (MetadataConfig Pattern)

File: `src/android_config/manifest/withCleverTapAndroidManifest.ts`

All manifest metadata is managed via a single `METADATA_CONFIGS` array. Each entry is:

```typescript
interface MetadataConfig {
    key: string;                                          // AndroidManifest meta-data key
    getValue: (props, config?) => string | undefined;    // undefined = REMOVE the entry
    onAdd?: (props, androidManifest) => void;            // called on add (e.g., add permission)
    onRemove?: (androidManifest) => void;                // called on remove (e.g., remove permission)
}
```

This is **bidirectional**: disabling a feature removes its manifest entry and associated side effects.

### Current Metadata Entries

| Key | Value Source | Side Effects |
|-----|-------------|--------------|
| `CLEVERTAP_ACCOUNT_ID` | `props.accountId` | — |
| `CLEVERTAP_TOKEN` | `props.accountToken` | — |
| `CLEVERTAP_REGION` | `props.accountRegion` | — |
| `CLEVERTAP_USE_GOOGLE_AD_ID` | `"1"` if `enableGoogleAdId` | +/- `com.google.android.gms.permission.AD_ID` |
| `CLEVERTAP_IDENTIFIER` | `props.customIdentifiers` | — |
| `CLEVERTAP_NOTIFICATION_ICON` | `"notification_icon.png"` if `config.notification.icon` set | — |
| `CLEVERTAP_BACKGROUND_SYNC` | `props.android.backgroundSync` | — |
| `CLEVERTAP_DEFAULT_CHANNEL_ID` | `props.android.defaultNotificationChannelId` | — |
| `CLEVERTAP_INAPP_EXCLUDE` | `props.android.inAppExcludeActivities` | — |
| `CLEVERTAP_PROXY_DOMAIN` | `props.proxyDomain` | — |
| `CLEVERTAP_SPIKY_PROXY_DOMAIN` | `props.spikyProxyDomain` | — |
| `CLEVERTAP_ENCRYPTION_LEVEL` | `props.encryptionLevel.toString()` | — |
| `CLEVERTAP_SSL_PINNING` | `props.android.sslPinning` | — |
| `CLEVERTAP_HANDSHAKE_DOMAIN` | `props.handshakeDomain` | — |
| `CLEVERTAP_DISABLE_APP_LAUNCHED` | `"1"` or `"0"` based on `props.disableAppLaunchedEvent` | — |
| `CLEVERTAP_PROVIDER_1` | HMS manifest entry string if `enableHmsPush` | — |
| `CLEVERTAP_ENCRYPTION_IN_TRANSIT` | `"1"` if `props.encryptionInTransit` | — |

### Services

When `enablePush = true`:
- Adds `com.clevertap.android.sdk.pushnotification.fcm.FcmMessageListenerService` (exported: true, MESSAGING_EVENT intent filter)
- Adds `com.clevertap.android.sdk.pushnotification.CTNotificationIntentService` (exported: false, PUSH_EVENT intent filter)

Both services are **removed** when `enablePush = false`.

### Adding a New Metadata Entry

Add to `METADATA_CONFIGS` array in `withCleverTapAndroidManifest.ts`:

```typescript
{
    key: 'CLEVERTAP_MY_FEATURE',
    getValue: (props) => props.android?.features?.enableMyFeature ? "1" : undefined
}
```

---

## 2. Android Resources (strings.xml)

File: `src/android_config/res/withCleverTapAndroidResources.ts`  
API: `withStringsXml`

Writes string values that the native Kotlin module reads at runtime:

| String Key | Source | Default |
|------------|--------|---------|
| `expo_clevertap_register_activity_lifecycle_callbacks` | `props.android.registerActivityLifecycleCallbacks` | `"true"` |
| `expo_clevertap_enable_push_templates` | `props.android.features.enablePushTemplates` | `"false"` |
| `expo_clevertap_log_level` | `props.logLevel` | `"-1"` |

The Kotlin module (`CleverTapReactApplicationLifecycleListener`) reads these from generated `R.string` resources at runtime.

**To add a new runtime-configurable value:**
1. Add the string to `STRING_KEYS` map
2. Add a `DEFAULT_VALUES` entry
3. Add `addOrUpdateString()` call reading from props
4. Read it in `CleverTapReactApplicationLifecycleListener.kt`

---

## 3. Gradle Properties System

Files:
- `src/android_config/utility/constants.ts` — key names + default versions
- `src/android_config/utility/utils.ts` — property creation helpers
- `src/android_config/gradle/withClevertapAndroidAppBuildGradle.ts` — writes to `gradle.properties`

### Feature Flags Written to `gradle.properties`

```
clevertapCoreEnabled=true           # always true
clevertapPushEnabled=false
clevertapPushTemplatesEnabled=false
clevertapInAppEnabled=false
clevertapInboxEnabled=false
clevertapMediaForInAppsInboxEnabled=false
clevertapInstallReferrerEnabled=false
clevertapHmsPushEnabled=false
clevertapGoogleAdIdEnabled=false
clevertapPlayReviewEnabled=false
```

### Default Dependency Versions Written to `gradle.properties`

```
clevertapCoreSdkVersion=7.5.2
androidxCoreVersion=1.13.0
firebaseMessagingVersion=24.0.0
clevertapPushTemplatesSdkVersion=2.1.0
appCompatVersion=1.7.0
fragmentVersion=1.5.4
recyclerViewVersion=1.3.2
viewPagerVersion=1.0.0
materialVersion=1.12.0
glideVersion=4.12.0
media3Version=1.4.0
installReferrerVersion=2.2
clevertapHmsSdkVersion=1.5.0
hmsPushVersion=6.11.0.300
playServicesAdsVersion=18.2.0
playReviewVersion=2.0.2
```

**Update behavior**: new properties are appended; existing ones are updated if value differs.

### Dependency Template (app/build.gradle)

File: `src/android_config/utility/androidAppDepsTemplate.ts`

Uses `mergeContents` with tag `clevertap-sdk-dependencies` to inject conditionally into the `dependencies {}` block.

Each feature group is a separate function returning a Groovy snippet:

```typescript
const generateCoreDependencies = () => `
    // Core features
    implementation("com.clevertap.android:clevertap-android-sdk:${getVersionProperty(KEYS.CLEVERTAP_SDK_VERSION)}")
    implementation("androidx.core:core:${getVersionProperty(KEYS.ANDROIDX_CORE_VERSION)}")`;
```

The template uses `project.findProperty('key') ?: 'defaultVersion'` — so gradle.properties controls versions, with fallback to hardcoded defaults.

---

## 4. Root Gradle (settings.gradle + root build.gradle)

File: `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts`

**Current hardcoded classpath versions:**

| Classpath | Version |
|-----------|---------|
| `com.google.gms:google-services` | `4.4.2` |
| `com.huawei.agconnect:agcp` | `1.9.1.301` |
| `com.android.tools.build:gradle` | `8.6.0` |

- `withCleverTapSettingsGradle` — adds Huawei Maven repo inside first `repositories {}` block
- `withCleverTapRootGradle` — adds/updates classpaths; adds HMS Maven repo to **all** `repositories {}` blocks (using tagged marker `@clevertap-hms-repositories-begin/end` for idempotency)

Google Services classpath is only added when `enablePush = true`.  
HMS + AGP classpaths are only added when `enableHmsPush = true`.

---

## 5. File Copy Operations

File: `src/android_config/io/withCleverTapAndroidCopyFiles.ts`  
API: `withDangerousMod` (platform: `'android'`)

### HMS Config

Source: `{projectRoot}/assets/agconnect-services.json`  
Dest: `{projectRoot}/android/app/agconnect-services.json`  
Condition: `enableHmsPush = true`

### Custom Notification Sounds

Source: `{projectRoot}/assets/{soundFileName}`  
Dest: `{projectRoot}/android/app/src/main/res/raw/{soundFileName}`

- Accepts `string` or `string[]` in `props.android.customNotificationSound`
- Tracks copied files in `clevertap_copied_sounds.txt` marker file
- **Cleans up** sounds removed from config (removed from marker file)
- Skips re-copy if file sizes match and destination is newer

---

## 6. Complete Feature Checklist (for adding a new Android feature)

- [ ] `types/androidTypes.ts` — add to `Features` (and `Dependencies` if versioned)
- [ ] `src/android_config/utility/constants.ts` — add key to `CLEVERTAP_GRADLE_PROPERTIES_KEYS` + version to `CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS`
- [ ] `src/android_config/utility/utils.ts` `createFeatureProperties()` — add `createGradleProperty(KEYS.MY_KEY, ...)`
- [ ] `src/android_config/utility/androidAppDepsTemplate.ts` — add `generateMyFeatureDependencies()` and include in `generateDependenciesTemplate()`
- [ ] `src/android_config/gradle/withClevertapAndroidAppBuildGradle.ts` — add to destructured features
- [ ] `src/android_config/gradle/withCleverTapAndroidAppRootBuildGradle.ts` — add to destructured features in both plugin + sub-functions if classpath/repo needed
- [ ] `src/android_config/manifest/withCleverTapAndroidManifest.ts` — add MetadataConfig if manifest entry needed
- [ ] `src/android_config/res/withCleverTapAndroidResources.ts` — add string if value needs runtime access by Kotlin
- [ ] `android/src/main/.../CleverTapReactApplicationLifecycleListener.kt` — read new string if added above
- [ ] `CTExample/app.json` — add feature to plugin config
