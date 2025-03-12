<p align="center">
 <img src="https://github.com/CleverTap/clevertap-ios-sdk/blob/master/docs/images/clevertap-logo.png" width = "50%"/>
</p>

# CleverTap Expo Plugin
[![npm version](https://badge.fury.io/js/clevertap-expo-plugin.svg)](https://badge.fury.io/js/clevertap-expo-plugin)
<a href="https://github.com/CleverTap/clevertap-expo-plugin/releases">
    <img src="https://img.shields.io/github/release/CleverTap/clevertap-expo-plugin.svg" />
</a>
[![npm downloads](https://img.shields.io/npm/dm/clevertap-expo-plugin.svg)](https://www.npmjs.com/package/clevertap-expo-plugin)

> **Beta Status Notice**: This plugin is currently in beta. While it is fully functional and has undergone testing, you may encounter occasional issues. We welcome your feedback to improve the plugin before its stable release.

## 👋 Introduction
Learn how to integrate the CleverTap SDK into your Expo React Native application. This guide explains how to set up and configure CleverTap's features using the Expo plugin.

For more information check out our [website](https://clevertap.com/ "CleverTap")  and  [documentation](https://developer.clevertap.com/docs/ "CleverTap Technical Documentation").

To get started, sign up [here](https://clevertap.com/live-product-demo/).

## 📋 Overview
Expo is a framework and platform built around React Native that helps you develop, build, and deploy React Native applications quickly. The CleverTap Expo plugin provides a streamlined way to integrate the CleverTap React Native SDK into your Expo application without writing native code.
It enables customization during the prebuild phase of managed workflow builds, eliminating the need to eject to a bare workflow. Specifically tailored for CleverTap integration, this plugin simplifies the setup by automatically generating and configuring the required native code files to ensure the CleverTap React Native SDK functions seamlessly. Consider this plugin as an automated way to implement the required native configurations, saving you from manually writing platform-specific code for CleverTap integration.

## 🧩 Compatibility Matrix
To ensure smooth integration of the CleverTap Expo plugin, please reference the following compatibility matrix. This table outlines the supported versions of CleverTap Expo Plugin, Expo SDK, React Native, and the CleverTap React Native SDK that work together effectively.

| CleverTap Expo Plugin version | Expo SDK version | React Native version | CleverTap React Native SDK version |
|-------------------------------|------------------|----------------------|------------------------------------|
| 0.0.1                     | 52.0.0           | 0.76                 | 3.2.0                              |


## 🚀 Install and Integration

### Step 1: Install the CleverTap React Native SDK
```sh
npm install clevertap-react-native
```

### Step 2: Install the CleverTap Expo Plugin
```sh
npx expo install @clevertap/clevertap-expo-plugin
```

### Step 3: Add the plugin to your app.json

In your `app.json` file, add the CleverTap Expo Plugin configuration. Below is an example configuration showing both mandatory and optional parameters with their default values where applicable:

**app.json**
```json
{
  "expo" : {
    "plugins": [
      [
        "@clevertap/clevertap-expo-plugin",
        {
          "accountId": "WWW-AAA-BBBB",
          "accountToken": "AAA-BBB-CCCC",
          "accountRegion": "eu1",
          "disableAppLaunchedEvent": false,
          "logLevel": 0, 
          "encryptionLevel": 1, 
          "proxyDomain": "analytics.example.com", 
          "spikyProxyDomain": "spiky.example.com",
          "customIdentifiers": "Email,Phone", 
          "android": {
            "features": {
              "enablePush": true, 
              "enablePushTemplates": true, 
              "enableInApp": true, 
              "enableInbox": true, 
              "enableMediaForInAppsInbox": true, 
              "enableInstallReferrer": true, 
              "enableHmsPush": false, 
              "enableGoogleAdId": false 
            },
           "customNotificationSound": ["notification_sound.mp3", "alert_tone.mp3","reminder. mp3"], 
           "backgroundSync": "1", 
           "defaultNotificationChannelId": "default_channel", 
           "inAppExcludeActivities": "SplashActivity", 
           "sslPinning": "1", 
           "registerActivityLifecycleCallbacks": true 
          },
           "ios": {
            "mode": "development", //Mandatory
            "disableIDFV": true, //Optional, default: false
            "enableFileProtection": true, //Optional, default: false
            "enableURLDelegateChannels": [ 0, 1, 2 ], //Optional, default: null
            "notifications": {
              "enableRichMedia": true, 
              "enablePushImpression": true, 
              "enablePushTemplate": true, 
              "enablePushInForeground": true, 
              "iosPushAppGroup": "group.com.clevertap.expoDemo", 
              "notificationCategories": [
                {
                  "identifier": "CTNotification",
                  "actions": [ { "identifier": "action1",  "title": "title1" } ]
                }
              ] 
            }
          }
        }
      ]
    ]
  }
  }
```

### Step 4: Configure your app.json
The CleverTap Expo plugin supports a wide range of configuration options to customize your integration:

#### Core Configuration Options

| Property | Type | Description | Default Behavior |
|----------|------|-------------|-----------------|
| accountId | string | Required. Your CleverTap Account ID, available in the CleverTap dashboard under Settings. | No default, must be provided. |
| accountToken | string | Required. Your CleverTap Account Token, available in the CleverTap dashboard under Settings. | No default, must be provided. |
| accountRegion | string | Optional. Your CleverTap account region, e.g., "in1", "us1", "sg1", etc. | If not specified, region is determined automatically based on your account. |
| disableAppLaunchedEvent | boolean | Optional. Set to true to disable automatic App Launched event tracking. | Default is false (App Launched event is tracked). |
| logLevel | number | Optional. The logging level. | Default is -1 (all logging disabled). Set to 0 for minimal SDK integration logging, 2 for debug output, or 3 for verbose output. |
| encryptionLevel | number | Optional. Set to 1 to enable encryption of PII data. | Default is 0 (no encryption). |
| proxyDomain | string | Optional. Your custom proxy domain, e.g., "analytics.yourdomain.com". | Default is null (uses standard CleverTap endpoints). |
| spikyProxyDomain | string | Optional. Your custom spiky proxy domain for push impression events. | Default is null (uses standard CleverTap endpoints). |
| customIdentifiers | string | Comma-separated list of custom identifiers to enable custom identity management. Specify which identifiers (e.g., "Email", "Phone", "Identity" or any combinations of them) CleverTap should use for user identification during `onUserLogin()` calls. | Default is Identity,Email. |

#### Android-Specific Configuration

| Property | Type | Description | Default Behavior |
|----------|------|-------------|-----------------|
| android.features.enablePush | boolean | Enable Firebase Cloud Messaging integration for push notifications. When enabled, CleverTap automatically handles FCM notifications. When disabled, developers must manually handle CleverTap push notifications through custom implementation or third-party push plugins. | Default is false (automatic FCM handling disabled). |
| android.features.enablePushTemplates | boolean | Enable advanced push templates. When enabled, CleverTap will support rich, interactive push notification templates with custom UI components, such as auto-carousel push notifications, rating notifications, product display notifications, and other interactive templates. | Default is false (push templates disabled). |
| android.features.enableInApp | boolean | Enable in-app messages. When enabled, CleverTap will display in-app notifications according to your campaigns configured in the dashboard. | Default is false (in-app messages disabled). |
| android.features.enableInbox | boolean | Enable App Inbox feature. When enabled, CleverTap creates a dedicated section within your app where users can receive and access persistent content sent directly from the CleverTap dashboard. This content remains accessible to users until explicitly deleted, unlike standard push notifications that disappear once viewed. | Default is false (app inbox disabled). |
| android.features.enableMediaForInAppsInbox | boolean | Enable media support for in-app messages and app inbox. When enabled, your in-app notifications and inbox messages can display video content. | Default is false (media support disabled). |
| android.features.enableInstallReferrer | boolean | Enable install attribution tracking. When enabled, CleverTap will track installation attribution data to help measure campaign effectiveness. | Default is false (install attribution disabled). |
| android.features.enableHmsPush | boolean | Enable Huawei Push Service (HMS) integration. When enabled, CleverTap will send push notifications through both HMS and FCM, ensuring delivery to Huawei devices that don't support Google services. | Default is false (HMS push disabled). |
| android.features.enableGoogleAdId | boolean | Enable Google Advertising ID collection. When enabled, CleverTap will use the Google Advertising ID to uniquely identify users instead of generating its own device identifiers. | Default is false (Google Ad ID collection disabled). |
| android.customNotificationSound | string or string[] | Specify custom notification sound file(s) placed in the assets folder. These sound files can then be used when creating notification channels in your app with `CleverTapAPI.createNotificationChannel()`. | Default is null (uses default system sound). |
| android.backgroundSync | string | Enable CleverTap's Pull Notification via background ping service. When set to "1", this feature enables reaching users on devices that suppress or restrict regular push notifications through GCM/FCM, providing an alternative delivery mechanism. | Default is "0" (background sync disabled). |
| android.defaultNotificationChannelId | string | Specify a default notification channel ID for push notifications. This channel will be used as a fallback when a push notification specifies a channel that doesn't exist in the app, ensuring notifications are always displayed. | Default is null (falls back to a CleverTap created "Miscellaneous" channel if no valid channel is found). |
| android.inAppExcludeActivities | string | Comma-separated list of activities where in-app messages should not be shown. | Default is null (shows in-apps in all activities). |
| android.sslPinning | string | Set to "1" to enable SSL pinning for added security. | Default is "0" (SSL pinning disabled). |
| android.registerActivityLifecycleCallbacks | boolean |  Register activity lifecycle callbacks automatically. When enabled, CleverTap will automatically register for Android activity lifecycle events. This is strongly recommended as many CleverTap features depend on these callbacks to function properly, including session tracking, in-app notifications, and user engagement metrics. | Default is true (lifecycle callbacks enabled). |

#### iOS-Specific Configuration

| Property | Type | Description | Default Behavior |
|----------|------|-------------|-----------------|
| iOS.mode | string | Set the APNs environment in entitlement to "development" or "production" for push notifications. This determines whether the app uses the sandbox or production APNs servers. | Default value is automatically set based on the provisioning profile. |
| iOS.disableIDFV | Boolean | Disable the collection of Identifier for Vendor (IDFV) on iOS devices. | Default value is true to use IDFV as unique identifier. |
| iOS.enableFileProtection | boolean | Enable file protection by setting the "NSDataWritingFileProtectionComplete" option when writing data to disk, ensuring maximum security by restricting access until the device is unlocked. | Default is NSFileProtectionCompleteUntilFirstUserAuthentication, meaning the file is inaccessible only until the user unlocks the device for the first time after boot. |
| iOS.notifications.notificationCategories | [NotificationCategory] | Enable when the client wants to define and handle custom notification categories, enabling interactive notification actions such as buttons or custom UI elements. | Default is null. |
| iOS.notifications.enablePushInForeground | Boolean | This value should be set when client wants to receive push notifications in the foreground. | Default is false. |
| iOS.notifications.enableRichMedia | Boolean | Enable if user wants to integrate CTNotificationService Extension. Client will be able to use Rich Push from dashboard. | Default is false (fallback to only receive standard push notifications without rich media content). |
| iOS.notifications.enablePushTemplate | Boolean | This value should be set to true if user wants to add Notification Content Extension target. | Default is false (fallback to only receive standard push notifications without rich media content). |
| iOS.notifications.enablePushImpression | Boolean | Enable if user wants to integrate CTNotificationService Extension. This value should be set to true if user wants to enable logging Push Impressions event on Dashboard. | Default is false. |
| iOS.notifications.iosPushAppGroup | string | This value should be set to to enable logging Push Impressions to dashboard. The user profile details should be saved in specified "app group". When push notification is received, the saved profile details will be used to log Push Impression to correct profile. | Default is null. (Should be set to log Push Impressions) |


### Step 5: Additional Android Configurations
Configure additional Android-specific settings in your app.json file.

#### Step 5.1: Android Permissions
To ensure that CleverTap functions properly, add the required permissions to your app.json:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.INTERNET",
        "android.permission.POST_NOTIFICATIONS"
      ]
    }
  }
}
```
- **ACCESS_NETWORK_STATE**: Allows CleverTap to check network connectivity before attempting data transfers
- **INTERNET**: Required for CleverTap to send and receive data from servers
- **POST_NOTIFICATIONS**: Required for Android 13+ devices to display push notifications


### Step 6: Additional Android Configuration for Push Notifications (Optional)
After setting up the basic configuration in your app.json, you may need additional platform-specific setup to ensure proper functioning of push notifications on Android devices. The following sub-steps will guide you through configuring Firebase Cloud Messaging (FCM), Huawei Mobile Services (HMS) Push, and custom notification icons.

#### Step 6.1: Firebase Cloud Messaging (FCM) Configuration
For Firebase Cloud Messaging on Android, place your google-services.json file in the assets folder and add the following to your app.json:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./assets/google-services.json"
    }
  }
}
```

#### Step 6.2: Huawei Messaging Services (HMS) Push Configuration
If you've enabled HMS Push support by setting `android.features.enableHmsPush` to `true`, place your agconnect-services.json file in the assets folder of your project. No specific property needed for agconnect-services.json, just ensure it's placed in the assets folder.

#### Step 6.3: Custom Notification Icon
You can customize your notification icon using the standard Expo configuration. Add the following to your app.json:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png"
    }
  }
}
```
The CleverTap Expo plugin will automatically use this icon for notifications. Ensure that your icon follows Android's guidelines for notification icons.

### Step 7: Additional iOS Configuration for Push Impressions (Optional)

After configuring the basic settings in your app.json, the next step is to create an App Group Identifier to enable data sharing between your main app and the Notification Service Extension. This app group will be assigned to both the main target and the Notification Service Extension target during the prebuild phase. 
For detailed steps on App Group configuration, refer to this (documentation)[https://developer.apple.com/documentation/xcode/configuring-app-groups].

```
"ios": {
...
  "notifications": {
    "enablePushImpression": true,
    "iosPushAppGroup": "group.com.clevertap.expoDemo"
  }
...
}
```

Within your app, you'll need to save profile data—such as Name, Identity, Email, and Phone in UserDefaults. Our example app includes sample code demonstrating this process. The stored profile data will then be retrieved by the Notification Service Extension (NSE) to send it to CleverTap's servers. You can find more details here: React Native Push Notification – (iOS Push Impression)[https://developer.clevertap.com/docs/react-native-push-notification#push-impression-in-ios].

```
userDefaults.set("CTProfileName", 'testUserA1', "group.com.clevertap.expoDemo", (err, data) => {
  if (!err) console.log('Saved CTProfileName: testUserA1')
})
//remaining data
...
```

### Step 8: Prebuild your application

Run the following command to generate native files required for the CleverTap Expo plugin:
```sh
npx expo prebuild
```
Use `npx expo prebuild --clean` to regenerate native code from scratch by deleting existing native directories. This is useful for major config or native code changes to ensure a fresh build.

### Step 9: Import and use CleverTap React Native SDK APIs in your application

```
const CleverTap = require('clevertap-react-native');

CleverTap.recordEvent('testEvent');

CleverTap.setLocation(34.15, -118.2);
```

### Step 10: Testing Your Integration
To verify your CleverTap integration is working properly:

- Install and run your app
- Call the onUserLogin method with a test user profile
- Record a few test events
- Check the CleverTap dashboard to ensure the user profile and events are being tracked
- Test push notifications by sending a test campaign from the CleverTap dashboard

## 📣 Important Notes and Recommendations for Android

### File Locations
- **HMS Configuration File**: The `agconnect-services.json` file must be placed at the root level of your project's assets folder for HMS push integration to function correctly.
- **Notification Sound Files**: All custom notification sound files must be placed at the root level of your project's assets folder. These cannot be in subdirectories.
- **Other Files**: Files like `google-services.json` and notification icons can be placed in subdirectories within your assets folder if referenced properly in your app.json configuration.

### Google Services Configuration
- **google-services.json**: This file is required if you enable Firebase Cloud Messaging (`android.features.enablePush = true`). It must be placed in your project's assets folder and referenced in app.json using the `googleServicesFile` property.
- **Obtaining the File**: Download this file from your Firebase console project settings. Without a valid configuration, push notifications will not work correctly.
- **Testing**: After integration, send a test push from the CleverTap dashboard to verify proper setup.

### Huawei Push Services
- **agconnect-services.json**: Required if you enable Huawei Mobile Services push (`android.features.enableHmsPush = true`). This file must be placed at the root level of your project's assets folder.
- **No Explicit Reference Needed**: Unlike google-services.json, you don't need to reference this file in app.json, but it must be present in the assets folder.
- **AppGallery Connect**: Generate this file from the Huawei AppGallery Connect console for your application.

### Custom Notification Sounds
- **Sound File Formats**: Use .mp3, .wav, or .ogg files for notification sounds.
- **Asset Placement**: Place sound files at the root level of your assets folder. Subdirectories are not supported for sound files.
- **Channel Registration**: After the prebuild, you must register a notification channel with your custom sound in your application code:
  ```javascript
  CleverTap.createNotificationChannel(
   "channel_id",
   "Channel Name",
   "Channel Description",
   5, 
   true, 
   "sound_file.mp3" 
  );
  ```

### Custom Notification Icons

- **Icon Requirements:** Your notification icon should follow Android's guidelines. More info [here](https://docs.expo.dev/versions/latest/config/app/#icon-1)

- **Icon Configuration:** Use Expo's standard notification configuration in `app.json`:
    ```json
    "notification": {
      "icon": "./assets/notification-icon.png"
    }
    ```

### Feature Dependencies

- **Push Templates:** To use push templates, `android.features.enablePush` must also be enabled. Push templates are **not supported** through custom implementations.

- **Media Support:**
Enable `android.features.enableMediaForInAppsInbox` for video content in in-app messages and app inbox.

## 🆕 Changelog

Refer to the [CleverTap Expo plugin Change Log](/CHANGELOG.md).

## 🎬 Sample App
To see a React Native Expo app running with the CleverTap SDK, check out our [sample app on GitHub](./ctDemoApp/).

## 📝 Beta Feedback
Since this plugin is in beta, we highly value your feedback to improve its stability and functionality. If you encounter any issues, have suggestions, or want to share your experience with the plugin, please:

1. Submit detailed bug reports through GitHub Issues
2. Include specific steps to reproduce any problems
3. Share your environment details (Expo version, React Native version, device information)
4. Suggest enhancements or features you'd like to see in future releases

Your input is crucial for the success of this plugin and will help us prepare for the stable release.

## ⁉️ Help and Questions?

 If you have questions or concerns, you can reach out to the CleverTap support team from the CleverTap Dashboard.