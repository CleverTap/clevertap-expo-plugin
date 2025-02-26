import {
  ConfigPlugin,
  withAppDelegate
} from "@expo/config-plugins";
import { CleverTapPluginProps } from "../../types/types";
import {
  addCleverTapImportsForAutoIntegrate,
  addCleverTapAutoIntegrate,
  addCleverTapImportsTemplates,
  addCleverTapTemplates,
  addCleverTapNotificationCategory,
  addCleverTapURLDelegate,
  addEnablePushInForeground
} from "../../support/UpdateAppDelegate";

/**
* Update AppDelegate with required CleverTap's setup 
*/
export const withCleverTapAppDelegate: ConfigPlugin<CleverTapPluginProps> = (config,
  clevertapProps) => {
  return withAppDelegate(config, (config) => {
    let appDelegate = config.modResults.contents;
    // Adds imports at the top
    // if (!appDelegate.includes('[CleverTap autoIntegrate]')) {
    //   config.modResults.contents = addCleverTapImportsForAutoIntegrate(appDelegate)
    //   appDelegate = config.modResults.contents;
    //   config.modResults.contents = addCleverTapAutoIntegrate(appDelegate, clevertapProps.logLevel ?? 0)
    // }

    // Adds Custom template
    // if (!appDelegate.includes('registerCustomTemplates') && clevertapProps.ios?.templateIdentifiers?.templates) {
    //   config.modResults.contents = addCleverTapImportsTemplates(appDelegate)
    //   appDelegate = config.modResults.contents;
    //   config.modResults.contents = addCleverTapTemplates(appDelegate, clevertapProps.ios?.templateIdentifiers)
    // }
    // Adds UNNotificationCategory code
    // if (!appDelegate.includes('UNNotificationCategory') && (clevertapProps.ios?.notifications?.notificationCategories?.length ?? 0 > 0)) {
    //   appDelegate = config.modResults.contents;
    //   config.modResults.contents = addCleverTapNotificationCategory(appDelegate, clevertapProps.ios?.notifications?.notificationCategories)
    // }

    // Adds CleverTapURLDelegate code
    // if (!appDelegate.includes('CleverTapURLDelegate.h') && clevertapProps.ios?.enableURLDelegateChannels) {
    //   appDelegate = config.modResults.contents;
    //   config.modResults.contents = addCleverTapURLDelegate(appDelegate, clevertapProps.ios?.enableURLDelegateChannels)
    // }

    // Adds willPresentNotification function
    // if (!appDelegate.includes('willPresentNotification') && clevertapProps.ios?.notifications?.enablePushInForeground) {
    //   appDelegate = config.modResults.contents;
    //   config.modResults.contents = addEnablePushInForeground(appDelegate)
    // }
    return config;
  });
};