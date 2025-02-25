import {
    ConfigPlugin,
    withInfoPlist
  } from "@expo/config-plugins";
import { CleverTapPluginProps } from "../../types/types";
import { CleverTapLog } from "../../support/CleverTapLog";

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
      CleverTapLog.log(`Setting region code: ${clevertapProps.accountRegion}`);
    }
    if (clevertapProps.proxyDomain) {
      config.modResults.CleverTapProxyDomain = clevertapProps.proxyDomain;
      CleverTapLog.log(`Setting proxyDomain: ${clevertapProps.proxyDomain}`);
    }
    if (clevertapProps.spikyProxyDomain) {
      config.modResults.CleverTapSpikyProxyDomain = clevertapProps.spikyProxyDomain;
      CleverTapLog.log(`Setting spikyProxyDomain: ${clevertapProps.spikyProxyDomain}`);
    }
    if (clevertapProps.disableAppLaunchedEvent) {
      config.modResults.CleverTapDisableAppLaunched = clevertapProps.disableAppLaunchedEvent;
      CleverTapLog.log(`Disabling the "App Launched" event reporting`);
    }
    if (clevertapProps.encryptionLevel) {
      config.modResults.CleverTapEncryptionLevel = clevertapProps.encryptionLevel;
      CleverTapLog.log(`Setting encryption level: ${clevertapProps.encryptionLevel}`);
    }
    if (clevertapProps.ios?.disableIDFV) {
      config.modResults.CleverTapDisableIDFV = clevertapProps.ios?.disableIDFV;
      CleverTapLog.log(`Disabling generation of CleverTap ID basis IDFV value.`);
    }
    if (clevertapProps.handshakeDomain) {
      config.modResults.CleverTapHandshakeDomain = clevertapProps.handshakeDomain;
      CleverTapLog.log(`Setting handshake domain value: ${clevertapProps.handshakeDomain}`);
    }
    if (clevertapProps.ios?.enableFileProtection) {
      config.modResults.CleverTapEnableFileProtection = clevertapProps.ios?.enableFileProtection;
      CleverTapLog.log(`Setting file protection value: ${clevertapProps.ios?.enableFileProtection}`);
    }
    return config;
  });
};