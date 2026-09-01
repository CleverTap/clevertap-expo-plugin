# Change Log
All notable changes to this project will be documented in this file.

### [Version 1.1.0](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/1.1.0) (September 1 2026)

#### Added
- Adds support for Expo SDK [57.0.0](https://expo.dev/changelog/sdk-57) and React Native [0.86](https://github.com/facebook/react-native/releases/tag/v0.86.3)
- Adds support for CleverTap React Native SDK [4.3.0](https://github.com/CleverTap/clevertap-react-native/blob/master/CHANGELOG.md#version-430-august-20-2026)

#### Android Platform ####
  - Adds support for CleverTap Android SDK [8.4.1](https://github.com/CleverTap/clevertap-android-sdk/blob/master/docs/CTCORECHANGELOG.md#version-841-august-7-2026)
  - Adds support for CleverTap Push Templates SDK [2.5.0](https://github.com/CleverTap/clevertap-android-sdk/blob/master/docs/CTPUSHTEMPLATESCHANGELOG.md#version-250-july-28-2026)
  - Adds `android.inAppFragmentlessBanners` config option, which writes the `CLEVERTAP_INAPP_FRAGMENTLESS_BANNERS` manifest flag so custom-HTML header and footer in-apps render when the host Activity is not a `FragmentActivity`. Off by default.

#### iOS Platform ####
  - Adds support for CleverTap iOS SDK [7.8.1](https://github.com/CleverTap/clevertap-ios-sdk/blob/master/CHANGELOG.md#version-781-august-7-2026), resolved transitively through `clevertap-react-native`.

### [Version 1.0.0](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/1.0.0) (March 26, 2026)

#### Added
- Adds support for Expo SDK [55.0.0](https://expo.dev/changelog/sdk-55) and React Native [0.83](https://reactnative.dev/blog/2025/01/21/react-native-0.83)
- Adds support for CleverTap React Native SDK [4.0.0](https://github.com/CleverTap/clevertap-react-native/blob/master/CHANGELOG.md#version-400-march-17-2026)

#### Android Platform ####
  - Adds `android.notificationIcon` config option for custom push notification icons (required for Expo 55+ where `notification.icon` was removed from app.json)

### [Version 0.0.4](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/0.0.4) (Jan 6, 2025)

> **Note**: This is a beta release. While fully functional, it may contain issues that will be addressed in future releases.

#### Fixed
- Fixes APNS push token not found issue.

### [Version 0.0.3](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/0.0.3) (Oct 30, 2025)

> **Note**: This is a beta release. While fully functional, it may contain issues that will be addressed in future releases.

#### Added
- Adds support for Expo SDK [53.0.0](https://expo.dev/changelog/sdk-53) and React Native [0.79](https://reactnative.dev/blog/2025/04/08/react-native-0.79)
- Adds support for CleverTap React Native SDK [3.7.0](https://github.com/CleverTap/clevertap-react-native/blob/master/CHANGELOG.md#version-370-october-3-2025)
- Adds `encryptionInTransit` parameter to enable encryption for all event data sent over the network.
- Adds `enablePlayReview` feature for Android to support Google Play In-App Review as a System In-App Function

### [Version 0.0.2](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/0.0.2) (May 26, 2025)

> **Note**: This is a beta release. While fully functional, it may contain issues that will be addressed in future releases.

#### Improvement
- Reduces npm package size
- 
#### Fixed
- Fixes an issue where push notifications do not persist in the notification tray when the app is in the foreground.

### [Version 0.0.1](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/0.0.1) (March 11, 2025)

> **Note**: This is a beta release. While fully functional, it may contain issues that will be addressed in future releases.

#### Added
- Initial beta release of Expo plugin to integrate clevertap-react-native sdk in managed workflow
- Support for CleverTap core functionality in Expo managed apps
- Automated native code configuration for both Android and iOS platforms
