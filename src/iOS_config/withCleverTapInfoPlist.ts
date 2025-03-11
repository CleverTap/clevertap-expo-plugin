import {
  ConfigPlugin,
  withInfoPlist
} from "@expo/config-plugins";
import { CleverTapPluginProps } from "../../types/types";
import { CleverTapLog } from "../../support/CleverTapLog";
import { NotificationCategory } from "../../types/iOSTypes";

interface NotificationProps {
  [key: string]: any;  // Allow dynamic keys with any value type
}

/**
* Add CleverTap credentials in Info.plist
*/
export const withCleverTapInfoPlist: ConfigPlugin<CleverTapPluginProps> = (
  config,
  clevertapProps
) => {
  return withInfoPlist(config, (config) => {
    config.modResults.CleverTapAccountID = clevertapProps.accountId;
    config.modResults.CleverTapToken = clevertapProps.accountToken;

    if (clevertapProps.accountRegion) {
      config.modResults.CleverTapRegion = clevertapProps.accountRegion;
      CleverTapLog.log(`Configuring app with region code: ${clevertapProps.accountRegion}`);
    }
    if (clevertapProps.proxyDomain) {
      config.modResults.CleverTapProxyDomain = clevertapProps.proxyDomain;
      CleverTapLog.log(`Configuring app with proxyDomain: ${clevertapProps.proxyDomain}`);
    }
    if (clevertapProps.spikyProxyDomain) {
      config.modResults.CleverTapSpikyProxyDomain = clevertapProps.spikyProxyDomain;
      CleverTapLog.log(`Configuring app with spikyProxyDomain: ${clevertapProps.spikyProxyDomain}`);
    }
    if (clevertapProps.customIdentifiers) {
      const customIdentifiers = clevertapProps.customIdentifiers.split(" ");
      config.modResults.CleverTapIdentifiers = customIdentifiers;
      CleverTapLog.log(`Configuring app with custom identifiers: ${clevertapProps.customIdentifiers}`);
    }
    if (clevertapProps.disableAppLaunchedEvent) {
      config.modResults.CleverTapDisableAppLaunched = clevertapProps.disableAppLaunchedEvent;
      CleverTapLog.log(`Disabling the "App Launched" event reporting`);
    }
    if (clevertapProps.encryptionLevel) {
      config.modResults.CleverTapEncryptionLevel = clevertapProps.encryptionLevel;
      CleverTapLog.log(`Configuring app with encryption level: ${clevertapProps.encryptionLevel}`);
    }
    if (clevertapProps.ios?.disableIDFV) {
      config.modResults.CleverTapDisableIDFV = clevertapProps.ios?.disableIDFV;
      CleverTapLog.log(`Disabling generation of CleverTap ID basis IDFV value.`);
    }
    if (clevertapProps.handshakeDomain) {
      config.modResults.CleverTapHandshakeDomain = clevertapProps.handshakeDomain;
      CleverTapLog.log(`Configuring app with handshake domain value: ${clevertapProps.handshakeDomain}`);
    }
    if (clevertapProps.ios?.enableFileProtection) {
      config.modResults.CleverTapEnableFileProtection = clevertapProps.ios?.enableFileProtection;
      CleverTapLog.log(`Configuring app with file protection value: ${clevertapProps.ios?.enableFileProtection}`);
    }

    //CTExpo internal props
    config.modResults.CTExpoLogLevel = clevertapProps.logLevel ?? -1;
    CleverTapLog.log(`Configuring CleverTap SDK logging value: ${clevertapProps.logLevel}`);

    if (!config.modResults.CTExpoNotificationProps) {
      config.modResults.CTExpoNotificationProps = {};
    }

    if (clevertapProps.ios?.notifications?.iosPushAppGroup != null) {
      const iosPushAppGroup = clevertapProps.ios?.notifications?.iosPushAppGroup;
      config.modResults.CTExpoPushAppGroup = iosPushAppGroup;
      CleverTapLog.log(`Configuring App group value:  ${iosPushAppGroup}`);
    }

    if (clevertapProps.ios?.notifications?.enablePushInForeground) {
      const enablePushInForeground = clevertapProps.ios?.notifications?.enablePushInForeground;

      // Add or update the NotificationProps key with your value
      (config.modResults.CTExpoNotificationProps as NotificationProps)[
        "EnablePushInForeground"
      ] = enablePushInForeground;
      CleverTapLog.log(`Configuring app to hanlde push in foreground: ${JSON.stringify(enablePushInForeground)}`);
    }

    if (clevertapProps.ios?.notifications?.notificationCategories != null) {
      const notificationCategories = clevertapProps.ios?.notifications?.notificationCategories as [NotificationCategory];

      (config.modResults.CTExpoNotificationProps as NotificationProps)[
        "NotificationCategories"
      ] = notificationCategories;
      CleverTapLog.log(`Configuring app to hanlde notification categories: ${JSON.stringify(notificationCategories)}`);
    }

    if (clevertapProps.ios?.enableURLDelegateChannels != null) {
      const enableURLDelegateChannels = clevertapProps.ios?.enableURLDelegateChannels;
      config.modResults.CTExpoURLDelegateChannels = enableURLDelegateChannels as [number];
      CleverTapLog.log(`Configuring app to hanlde url delegate for these channels: ${JSON.stringify(enableURLDelegateChannels)}`);
    }

    return config;
  });
};