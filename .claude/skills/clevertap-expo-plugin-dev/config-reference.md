# Config Reference — CleverTap Expo Plugin

## Full `CleverTapPluginProps` Schema

```typescript
type CleverTapPluginProps = {
  // REQUIRED
  accountId: string;          // CleverTap Project ID
  accountToken: string;       // CleverTap Project Token
  android: Android;           // Android config (always required)

  // OPTIONAL — cross-platform
  accountRegion?: string;     // e.g. "in1", "us1"
  proxyDomain?: string;       // Custom analytics proxy domain
  spikyProxyDomain?: string;  // Custom proxy for push impression events
  logLevel?: number;          // CleverTap log level (-1 = off, 0 = info, 2 = debug)
  disableAppLaunchedEvent?: boolean;  // Disable App Launched event
  handshakeDomain?: string;   // Custom handshake domain
  encryptionLevel?: CleverTapEncryptionLevel;  // 0 = None, 1 = Medium
  encryptionInTransit?: boolean;  // Encrypt all event data in transit
  customIdentifiers?: string; // Comma-separated: "Email,Phone"

  // OPTIONAL — platform-specific
  ios?: iOS;
}

enum CleverTapEncryptionLevel {
  None = 0,
  Medium = 1,
}
```

## Android Type

```typescript
interface Android {
  features: Features;                          // All feature flags (required)
  customNotificationSound?: string | string[]; // Sound file(s) from assets/
  backgroundSync?: string;                     // "0" or "1"
  defaultNotificationChannelId?: string;       // Default channel ID
  inAppExcludeActivities?: string;             // Comma-separated activity names
  sslPinning?: string;                         // "0" or "1"
  registerActivityLifecycleCallbacks?: boolean; // Default: true (via Kotlin module)
}

interface Features {
  enablePush?: boolean;                   // FCM push + Firebase classpath
  enablePushTemplates?: boolean;          // Push Templates SDK
  enableInApp?: boolean;                  // InApp dependency (appcompat, fragment)
  enableInbox?: boolean;                  // AppInbox dependencies
  enableMediaForInAppsInbox?: boolean;    // media3 ExoPlayer
  enableInstallReferrer?: boolean;        // Install Referrer SDK
  enableHmsPush?: boolean;               // HMS Push (Huawei)
  enableGoogleAdId?: boolean;            // Google Ad ID (AD_ID permission)
  enablePlayReview?: boolean;            // Google Play In-App Review (SDK 7.4.0+)
}
```

## iOS Type

```typescript
type iOS = {
  mode: string;                           // "development" | "production" — REQUIRED for iOS
  deviceFamily?: string;                  // "1" iPhone, "2" iPad, "1,2" both
  disableIDFV?: boolean;
  enableFileProtection?: boolean;
  enableURLDelegateChannels?: [number];
  notifications?: NotificationFeature;
}

type NotificationFeature = {
  notificationCategories?: [NotificationCategory];
  enablePushInForeground?: boolean;
  enableRichMedia?: boolean;     // Adds NSE target
  enablePushImpression?: boolean; // Also adds NSE target
  enablePushTemplate?: boolean;  // Adds NCE target
  iosNSEFilePath?: string;       // Custom NSE Swift file path
  iosNCEFilePath?: string;       // Custom NCE Swift file path
  iosPushAppGroup?: string;      // App group: "group.com.myapp.clevertap"
}
```

---

## Example `app.json` Plugin Config

```json
{
  "plugins": [
    [
      "@clevertap/clevertap-expo-plugin",
      {
        "accountId": "YOUR_ACCOUNT_ID",
        "accountToken": "YOUR_ACCOUNT_TOKEN",
        "accountRegion": "in1",
        "logLevel": 2,
        "encryptionLevel": 1,
        "encryptionInTransit": true,
        "customIdentifiers": "Email,Phone",
        "proxyDomain": "analytics.example.com",
        "android": {
          "features": {
            "enablePush": true,
            "enablePushTemplates": true,
            "enableInApp": true,
            "enableInbox": true,
            "enableMediaForInAppsInbox": true,
            "enableInstallReferrer": true,
            "enableGoogleAdId": true,
            "enablePlayReview": true
          },
          "customNotificationSound": ["notification.mp3", "alert.mp3"],
          "defaultNotificationChannelId": "default_channel",
          "registerActivityLifecycleCallbacks": true
        },
        "ios": {
          "mode": "development",
          "deviceFamily": "1,2",
          "disableIDFV": false,
          "enableFileProtection": true,
          "notifications": {
            "enableRichMedia": true,
            "enablePushImpression": true,
            "enablePushTemplate": true,
            "enablePushInForeground": true,
            "iosPushAppGroup": "group.com.example.clevertap"
          }
        }
      }
    ]
  ]
}
```

---

## How to Add a New Config Option

### Root-level (cross-platform)

1. Add to `CleverTapPluginProps` in `types/types.ts`
2. Android manifest: add to `METADATA_CONFIGS` in `src/android_config/manifest/withCleverTapAndroidManifest.ts`
3. iOS plist: add to `withCleverTapInfoPlist.ts`
4. If it affects runtime behavior read by Kotlin: add to `withCleverTapAndroidResources.ts` + native Kotlin

### Android-only feature flag

See `android-reference.md` → section 6 (Complete Feature Checklist)

### iOS-only option

1. Add to `iOS` or `NotificationFeature` in `types/iOSTypes.ts`
2. Conditionally apply in `src/withClevertapIos.ts`
3. Implement modifier in appropriate `src/iOS_config/` file

---

## Current Default Dependency Versions (as of v0.0.4)

| Dependency | Version |
|------------|---------|
| CleverTap Android SDK | `7.5.2` |
| androidx.core | `1.13.0` |
| firebase-messaging | `24.0.0` |
| push-templates | `2.1.0` |
| appcompat | `1.7.0` |
| fragment | `1.5.4` |
| recyclerview | `1.3.2` |
| viewpager | `1.0.0` |
| material | `1.12.0` |
| glide | `4.12.0` |
| media3 | `1.4.0` |
| installreferrer | `2.2` |
| clevertap-hms-sdk | `1.5.0` |
| HMS push | `6.11.0.300` |
| play-services-ads-identifier | `18.2.0` |
| play review | `2.0.2` |
| Google Services classpath | `4.4.2` |
| HMS classpath (agcp) | `1.9.1.301` |
| AGP classpath | `8.6.0` |
