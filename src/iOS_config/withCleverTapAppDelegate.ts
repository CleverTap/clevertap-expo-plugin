import {
  ConfigPlugin,
  withAppDelegate
} from "@expo/config-plugins";
import { CleverTapPluginProps } from "../../types/types";
import { CustomTemplate } from "../../types/iOSTypes";

/**
* Update AppDelegate with required CleverTap's setup 
*/
export const withCleverTapAppDelegate: ConfigPlugin<CleverTapPluginProps> = (config,
  clevertapProps) => {
  return withAppDelegate(config, (config) => {
    let appDelegate = config.modResults.contents;
    // Adds Custom template

    if (!appDelegate.includes('registerCustomTemplates') && clevertapProps.ios?.templateIdentifiers?.templates) {
      config.modResults.contents = addCleverTapImportsTemplates(appDelegate)
      appDelegate = config.modResults.contents;
      config.modResults.contents = addCleverTapTemplates(appDelegate, clevertapProps.ios?.templateIdentifiers)
    }
    return config;
  });
};

/**
 * Adds CleverTap's custom template code 
 */
const addCleverTapImportsTemplates = (appDelegate: string): string => {
  appDelegate = appDelegate.replace(
      `#import "AppDelegate.h"`,
      `#import "AppDelegate.h""
#import "CleverTapReactCustomTemplates.h"`
);
return appDelegate;
}

const addCleverTapTemplates = (appDelegate: string, templateIdentifiers: CustomTemplate): string => {
// Generate the custom templates string
const templatesString = templateIdentifiers.templates.map(id => `@"${id}"`).join(", ") + ", nil";
  appDelegate = appDelegate.replace(
      `return [super application:application didFinishLaunchingWithOptions:launchOptions];`,
      ` [CleverTapReactCustomTemplates registerCustomTemplates:${templatesString}];
 return [super application:application didFinishLaunchingWithOptions:launchOptions];`
      );
return appDelegate;
}
