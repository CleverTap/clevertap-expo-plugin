<p align="center">
 <img src="https://github.com/CleverTap/clevertap-ios-sdk/blob/master/docs/images/clevertap-logo.png" width = "50%"/>
</p>

# CleverTap Expo Plugin
[![npm version](https://badge.fury.io/js/clevertap-expo-plugin.svg)](https://badge.fury.io/js/clevertap-expo-plugin)
<a href="https://github.com/CleverTap/clevertap-expo-plugin/releases">
    <img src="https://img.shields.io/github/release/CleverTap/clevertap-expo-plugin.svg" />
</a>
[![npm downloads](https://img.shields.io/npm/dm/clevertap-expo-plugin.svg)](https://www.npmjs.com/package/clevertap-expo-plugin)

## 👋 Introduction
The CleverTap Expo plugin allows you to use CleverTap without leaving the managed workflow.

For more information check out our [website](https://clevertap.com/ "CleverTap")  and  [documentation](https://developer.clevertap.com/docs/ "CleverTap Technical Documentation").

To get started, sign up [here](https://clevertap.com/live-product-demo/).

## Overview
This plugin is an Expo Config Plugin designed to enhance the Expo configuration process. It enables customization during the prebuild phase of managed workflow builds, eliminating the need to eject to a bare workflow. Specifically tailored for CleverTap integration, this plugin simplifies the setup by automatically generating and configuring the required native code files to ensure the CleverTap React Native SDK functions seamlessly. Think of adding this plugin as incorporating custom native code into your project.

---

## 🚀 Install and Integration
You need both the `clevertap-expo-plugin` *and* the `clevertap-react-native` npm package.

```sh
npx expo install clevertap-expo-plugin

# npm
npm install clevertap-react-native

# yarn
yarn add clevertap-react-native
```

### Plugin Configuration in app.json / app.config.js
Add the plugin to the **front** of the [plugin array](https://docs.expo.dev/versions/latest/config/app/). If you used `npx expo install`, it should be added automatically. Ensure it is listed as the first plugin in the array, and configure any desired plugin properties as needed:

**app.json**
```json
{
  "plugins": [
    [
      "clevertap-expo-plugin",
      {
        "accountId": "CleverTapAccountID",
        "accountToken": "CleverTapToken"
      }
    ]
  ]
}
```

or

**app.config.js**
```js
export default {
  ...
  plugins: [
    [
      "clevertap-expo-plugin",
      {
        "accountId": "CleverTapAccountID",
        "accountToken": "CleverTapToken"
      }
    ]
  ]
};
```

#### Plugin Prop
You can pass props to the plugin config object to configure:

| Plugin Prop              |          |                                                                                                                                                                                                                                                                                                                                |
|--------------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `accountId`                   | **required** | To associate your iOS app with your CleverTap account, you need to add your CleverTap account Id   |
| `accountToken`                   | **required** | To associate your iOS app with your CleverTap account, you need to add your CleverTap account token   |
| `accountRegion`                   | optional | Used to enable the CleverTap region. Refer to [Region Codes](https://developer.clevertap.com/docs/idc#ios) for more information   |
| `logLevel`                   | optional | By default, CleverTap logs use CleverTapLogLevel.info. For development, it's recommended to enable DEBUG mode (CleverTapLogLevel.debug) to view warnings and important messages. In production, you can disable logs entirely by setting the log level to CleverTapLogLevel.off.   |
| `devTeam`                | optional | Used to configure Apple Team ID. You can find your Apple Team ID by running `expo credentials:manager`  e.g: `"91SW8A37CR"`                                                                                                                                                                                                    |
| `deploymentTarget` | optional | Target `DEPLOYMENT_TARGET` value to be used when adding the iOS [NSE](https://documentation.onesignal.com/docs/service-extensions). The deployment target defines the minimum operating system version that the application can run on. This value should align with the one specified in your Podfile e.g: `"12.0"` |
| `enableRichMedia` | optional | Used to enable Rich push notifications via CTNotificationService extension. App will be enabled to show push notifications with single media |
| `enablePushImpression` | optional | Used to log Push Impressions on dashboard via CTNotificationService extension |
| `enablePushTemplate` | optional | Used to enable Push templates via CTNotificationContent extension |
| `profileProps` | optional | Configure this to map Push Impressions to proper profile on dashboard |

---

## Prebuild (optional)
Prebuilding in Expo will result in the generation of the native runtime code for the project (and `ios` and `android` directories being built). By prebuilding, we automatically link and configure the native modules that have implemented CocoaPods, autolinking, and other config plugins. You can think of prebuild like a native code bundler.

When you run `expo prebuild` we enter into a custom managed workflow which provides most of the benefits of bare workflows and managed workflows at the same time.

#### Why should I prebuild?
It may make sense to prebuild locally to inspect config plugin changes and help in debugging issues.

#### Run
```sh
npx expo prebuild
```

```sh
# nukes changes and rebuilds
npx expo prebuild --clean
```

**EAS Note:** if you choose to stay in a fully managed workflow by not prebuilding, EAS will still run `npx expo prebuild` at build time. You can also prebuild locally but remain in a fully managed workflow by adding the `android` and `ios` directories to your .gitignore.

## Run
The following commands will prebuild *and* run your application. Note that for iOS, push notifications will **not** work in the Simulator.
```sh
# Build and run your native iOS project
npx expo run:ios

# Build and run your native Android project
npx expo run:android
```

---

## 🆕 Changelog

Refer to the [CleverTap Expo plugin Change Log](/CHANGELOG.md).

## ⁉️ Help and Questions?

 If you have questions or concerns, you can reach out to the CleverTap support team from the CleverTap Dashboard.
