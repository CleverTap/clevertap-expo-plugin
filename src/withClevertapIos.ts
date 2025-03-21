import {
  ConfigPlugin,
  withInfoPlist,
  withEntitlementsPlist
} from "@expo/config-plugins";
import { CleverTapPluginProps } from "../types/types";
import {
  withCleverTapNCE,
  withCleverTapXcodeProjectNCE
} from "./iOS_config/withCleverTapNotificationContentExtension";
import {
  withAppGroupPermissionsNSE,
  withCleverTapNSE,
  withCleverTapXcodeProjectNSE
} from "./iOS_config/withCleverTapNotificationServiceExtension";
import {
  withCleverTapInfoPlist
} from "./iOS_config/withCleverTapInfoPlist";
import {
  withCleverTapPod
} from "./iOS_config/withCleverTapPodfile";

/**
* Add 'aps-environment' record with current environment to '<project-name>.entitlements' file
*/
const withAppEnvironment: ConfigPlugin<CleverTapPluginProps> = (
  config,
  clevertapProps
) => {
  return withEntitlementsPlist(config, (newConfig) => {
    if (clevertapProps?.ios?.mode == null) {
      throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "clevertap-expo-plugin".
        "mode" can be either "development" or "production".`
      )
    }
    newConfig.modResults["aps-environment"] = clevertapProps.ios?.mode;
    return newConfig;
  });
};

/**
* Add `Background Modes -> Remote notifications` capbility
*/
const withRemoteNotificationsPermissions: ConfigPlugin<CleverTapPluginProps> = (config) => {
  const BACKGROUND_MODE_KEYS = ["remote-notification"];
  return withInfoPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults.UIBackgroundModes)) {
      newConfig.modResults.UIBackgroundModes = [];
    }
    for (const key of BACKGROUND_MODE_KEYS) {
      if (!newConfig.modResults.UIBackgroundModes.includes(key)) {
        newConfig.modResults.UIBackgroundModes.push(key);
      }
    }
    return newConfig;
  });
};

/**
* Add 'App groups' capability
*/
const withCleverTapEntitlements: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
  return withEntitlementsPlist(config, (config) => {
    // Add the app group to the main application target's entitlements.
    if (clevertapProps.ios?.notifications?.iosPushAppGroup != null) {
      const appGroupsKey = 'com.apple.security.application-groups';
      const existingAppGroups = config.modResults[appGroupsKey];
      if (Array.isArray(existingAppGroups) && !existingAppGroups.includes(clevertapProps.ios?.notifications?.iosPushAppGroup)) {
        config.modResults[appGroupsKey] = existingAppGroups.concat([clevertapProps.ios?.notifications?.iosPushAppGroup]);
      } else {
        config.modResults[appGroupsKey] = [clevertapProps.ios?.notifications?.iosPushAppGroup];
      }
    }
    return config;
  });
};

export const withCleverTapIos: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
  config = withAppEnvironment(config, clevertapProps);
  config = withRemoteNotificationsPermissions(config, clevertapProps);
  config = withCleverTapEntitlements(config, clevertapProps);

  const notifications = clevertapProps.ios?.notifications

  if (notifications?.enablePushTemplate) {
    config = withCleverTapNCE(config, clevertapProps);
    config = withCleverTapXcodeProjectNCE(config, clevertapProps);
  }
  if (notifications?.enableRichMedia || notifications?.enablePushImpression) {
    config = withCleverTapNSE(config, clevertapProps);
    config = withCleverTapXcodeProjectNSE(config, clevertapProps);
    config = withAppGroupPermissionsNSE(config, clevertapProps);
  }
  config = withCleverTapPod(config, clevertapProps);
  config = withCleverTapInfoPlist(config, clevertapProps);

  return config;
};