# iOS Reference — CleverTap Expo Plugin

## iOS Orchestrator Chain

File: `src/withClevertapIos.ts`

```
withCleverTapIos(config, props)
├── withAppEnvironment           → .entitlements: aps-environment (development/production)
├── withRemoteNotificationsPermissions → Info.plist: UIBackgroundModes += remote-notification
├── withCleverTapEntitlements    → .entitlements: com.apple.security.application-groups (if iosPushAppGroup)
├── [if enablePushTemplate]
│   ├── withCleverTapNCE         → copy NCE Swift/plist files via withDangerousMod
│   └── withCleverTapXcodeProjectNCE → add NCE Xcode target
├── [if enableRichMedia || enablePushImpression]
│   ├── withCleverTapNSE         → copy NSE Swift/plist files via withDangerousMod
│   ├── withCleverTapXcodeProjectNSE → add NSE Xcode target
│   └── withAppGroupPermissionsNSE → NSE entitlements: app group
├── withCleverTapPod             → Podfile: add clevertap-react-native pod + extension pods
├── withCleverTapInfoPlist       → Info.plist: credentials, IDFV, file protection, URL delegate
└── withCleverTapBridgingHeader  → Adds ObjC bridging header for Swift interop
```

---

## 1. Info.plist

File: `src/iOS_config/withCleverTapInfoPlist.ts`  
API: `withInfoPlist`

Sets CleverTap configuration keys directly in Info.plist. These are read by the CleverTap iOS SDK at app launch.

| Plist Key | Source | Notes |
|-----------|--------|-------|
| `CleverTapAccountID` | `props.accountId` | Required |
| `CleverTapToken` | `props.accountToken` | Required |
| `CleverTapRegion` | `props.accountRegion` | Optional |
| `CleverTapProxyDomain` | `props.proxyDomain` | Optional |
| `CleverTapSpikyProxyDomain` | `props.spikyProxyDomain` | Optional |
| `CleverTapHandshakeDomain` | `props.handshakeDomain` | Optional |
| `CleverTapDisableIDFV` | `props.ios.disableIDFV` | Optional boolean |
| `CleverTapEnableFileProtection` | `props.ios.enableFileProtection` | Optional boolean |
| `CleverTapURLDelegateChannels` | `props.ios.enableURLDelegateChannels` | Optional `[number]` |
| `CleverTapLogLevel` | `props.logLevel` | Optional number |
| `CleverTapEncryptionLevel` | `props.encryptionLevel` | Optional 0/1 |
| `CleverTapEncryptionInTransit` | `props.encryptionInTransit` | Optional boolean |
| `CleverTapDisableAppLaunchedEvent` | `props.disableAppLaunchedEvent` | Optional boolean |

### UIBackgroundModes

`withRemoteNotificationsPermissions` ensures `remote-notification` is present in `UIBackgroundModes`. This is always applied (not conditional).

---

## 2. Entitlements

### APS Environment (always applied)

```typescript
newConfig.modResults["aps-environment"] = clevertapProps.ios?.mode; // "development" | "production"
```

`mode` is **required** — throws if missing.

### App Groups (conditional on `iosPushAppGroup`)

```typescript
config.modResults['com.apple.security.application-groups'] = [props.ios.notifications.iosPushAppGroup];
```

---

## 3. Notification Service Extension (NSE)

File: `src/iOS_config/withCleverTapNotificationServiceExtension.ts`

Condition: `enableRichMedia = true` OR `enablePushImpression = true`

### `withCleverTapNSE` (file copy, `withDangerousMod`)

- Reads default NSE Swift from `support/serviceExtensionFiles/` OR user-provided `iosNSEFilePath`
- Writes Swift file to `ios/CleverTapNotificationServiceExtension/NotificationService.swift`
- Writes `Info.plist` for the NSE target
- Updates bundle versions via `NSUpdaterManager`

### `withCleverTapXcodeProjectNSE` (Xcode target, `withXcodeProject`)

- Adds a new Xcode target of type `app_extension`
- Adds build phases: Compile Sources, Frameworks, Resources
- Sets `DEVELOPMENT_TEAM`, `IPHONEOS_DEPLOYMENT_TARGET`, `TARGETED_DEVICE_FAMILY`
- Links to the main target's embed frameworks

### `withAppGroupPermissionsNSE` (NSE entitlements)

- Adds `com.apple.security.application-groups` to the NSE target's entitlements
- Condition: `iosPushAppGroup` is set

---

## 4. Notification Content Extension (NCE)

File: `src/iOS_config/withCleverTapNotificationContentExtension.ts`

Condition: `enablePushTemplate = true`

### `withCleverTapNCE` (file copy, `withDangerousMod`)

- Writes NCE Swift file to `ios/CleverTapNotificationContentExtension/`
- Writes NCE `Info.plist`

### `withCleverTapXcodeProjectNCE` (Xcode target, `withXcodeProject`)

- Adds NCE target with build phases and settings (similar to NSE)

---

## 5. Podfile

File: `src/iOS_config/withCleverTapPodfile.ts`  
API: `withDangerousMod` (platform: `'ios'`)

Uses `mergeContents` with tagged blocks for idempotency.

- Always adds `clevertap-react-native` pod for main target
- If NSE enabled: adds `CleverTap-iOS-SDK` pod for `CleverTapNotificationServiceExtension` target
- If NCE enabled: adds `CTNotificationContent` pod for `CleverTapNotificationContentExtension` target
- References Podfile snippets from `src/iOS_config/IOSConstants.ts`

---

## 6. Bridging Header

File: `src/iOS_config/withCleverTapBridgingHeader.ts`

Adds an ObjC-Swift bridging header to the main app target, importing:
- `CleverTap.h`
- `CleverTapReactManager.h`

---

## 7. iOS Constants

File: `src/iOS_config/IOSConstants.ts`

Centralizes:
- Target names: `NSE_TARGET_NAME = "CleverTapNotificationServiceExtension"`, `NCE_TARGET_NAME = "CleverTapNotificationContentExtension"`
- File names for NSE/NCE Swift and plist files
- Podfile snippet strings
- Regex patterns used for Podfile `mergeContents` anchors

**If you add a new iOS extension target, define its constants here.**

---

## 8. iOS Support Utilities

| File | Purpose |
|------|---------|
| `src/iOS_config/FileManager.ts` | Async `readFile`, `writeFile`, `copyFile` using `fs.promises` |
| `src/iOS_config/NSUpdaterManager.ts` | Updates `CFBundleVersion` and `CFBundleShortVersionString` in extension plists to match main app |

---

## 9. Adding a New iOS Feature

Example: adding an optional `enableSomeFeature` to `iOS` type.

1. **`types/iOSTypes.ts`** — add field to `iOS` or `NotificationFeature`
2. **`src/withClevertapIos.ts`** — add conditional modifier call
3. **`src/iOS_config/withCleverTapInfoPlist.ts`** — if it writes to Info.plist
4. **`src/iOS_config/IOSConstants.ts`** — if it needs new target names / file paths
5. **`src/iOS_config/withCleverTapPodfile.ts`** — if it needs new pods

---

## 10. iOS Config Summary Table

| iOS Feature | `iOSTypes.ts` Field | Applied By |
|-------------|--------------------|-----------:|
| APNs environment | `ios.mode` | `withAppEnvironment` |
| App group | `ios.notifications.iosPushAppGroup` | `withCleverTapEntitlements` + `withAppGroupPermissionsNSE` |
| Foreground push | `notifications.enablePushInForeground` | `withCleverTapInfoPlist` |
| Rich push / NSE | `notifications.enableRichMedia` | `withCleverTapNSE` + `withCleverTapXcodeProjectNSE` |
| Push impressions | `notifications.enablePushImpression` | (same as NSE, triggers NSE target) |
| Push templates / NCE | `notifications.enablePushTemplate` | `withCleverTapNCE` + `withCleverTapXcodeProjectNCE` |
| Custom NSE file | `notifications.iosNSEFilePath` | `withCleverTapNSE` (file source) |
| Custom NCE file | `notifications.iosNCEFilePath` | `withCleverTapNCE` (file source) |
| Disable IDFV | `ios.disableIDFV` | `withCleverTapInfoPlist` |
| File protection | `ios.enableFileProtection` | `withCleverTapInfoPlist` |
| URL delegate | `ios.enableURLDelegateChannels` | `withCleverTapInfoPlist` |
| Device family | `ios.deviceFamily` | NSE/NCE Xcode targets (`TARGETED_DEVICE_FAMILY`) |
