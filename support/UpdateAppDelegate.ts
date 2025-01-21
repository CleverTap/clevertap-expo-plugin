import { NotificationAction } from "../types/types";

/**
 * Adds CleverTap's auto integrate code 
 */
export const addCleverTapImportsAutoIntegrate = (appDelegate: string): string => {
    appDelegate = appDelegate.replace(
          `#import "AppDelegate.h"`,
          `#import "AppDelegate.h"
           #import <UserNotifications/UserNotifications.h>
           #import "CleverTap.h"
           #import "CleverTapReactManager.h"`
    );
    return appDelegate;
}
export const addCleverTapAutoIntegrate = (appDelegate: string, debugLevel: number): string => {
    // Adds CleverTap autoIntegrate
    appDelegate = appDelegate.replace(
          `return [super application:application didFinishLaunchingWithOptions:launchOptions];`,
          ` [CleverTap setDebugLevel:${debugLevel}];
            [CleverTap autoIntegrate];
            [[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];
            return [super application:application didFinishLaunchingWithOptions:launchOptions];`
    );
    return appDelegate;
}

/**
 * Adds CleverTap's custom template code 
 */
export const addCleverTapImportsTemplates = (appDelegate: string): string => {
    appDelegate = appDelegate.replace(
        `#import "CleverTapReactManager.h"`,
        `#import "CleverTapReactManager.h"
         #import "CleverTapReactCustomTemplates.h"`
  );
  return appDelegate;
}
export const addCleverTapTemplates = (appDelegate: string, templateIdentifier: string): string => {
    appDelegate = appDelegate.replace(
        `[CleverTap autoIntegrate];`,
        `[CleverTapReactCustomTemplates registerCustomTemplates:@"${templateIdentifier}", nil];
         [CleverTap autoIntegrate];`
        );
  return appDelegate;
}

/**
 * Adds CleverTapURLDelegate code 
 */

export const addCleverTapURLDelegate = (appDelegate: string): string => {
  if (appDelegate.includes('@interface AppDelegate () <')) {
    appDelegate = appDelegate.replace(
      `@interface AppDelegate () <`,
      `#import "CleverTapURLDelegate.h"
      @interface AppDelegate () < CleverTapURLDelegate, `
    );
  } else {
    appDelegate = appDelegate.replace(
      `@implementation AppDelegate`,
       `#import "CleverTapURLDelegate.h"
        @interface AppDelegate () <CleverTapURLDelegate> {  }  @end
        @implementation AppDelegate\n`
      );
  }
  appDelegate = appDelegate.replace(
    `@implementation AppDelegate`,
    `\n@implementation AppDelegate \n - (BOOL)shouldHandleCleverTapURL:(NSURL *)url forChannel:(CleverTapChannel)channel { \n  return YES; \n } \n`
  )
  return appDelegate;
}

/**
 * Update AppDelegate with required CleverTap's notification category code 
 */
const generateNotificationSetupCode = (categoryIdentifier: string, actions: [NotificationAction]): string => {
    // Generate action definitions
    const actionsCode = actions.map(
    (action, index) =>
      `UNNotificationAction *action${index + 1} = [UNNotificationAction actionWithIdentifier:@"${action.identifier}" title:@"${action.title}" options:UNNotificationActionOptionNone];`
     ).join("\n    ");
  
     // Combine actions into a category
    const actionIdentifiers = actions.map(
      (_, index) => 
        `action${index + 1}`
    ).join(", ");
  
    const categoryCode = `UNNotificationCategory *category = [UNNotificationCategory categoryWithIdentifier:@"${categoryIdentifier}" actions:@[${actionIdentifiers}] intentIdentifiers:@[] options:UNNotificationCategoryOptionNone];`;
    return `${actionsCode}\n    ${categoryCode}\n    [[UNUserNotificationCenter currentNotificationCenter] setNotificationCategories:[NSSet setWithObject:category]];`;
};

export const addCleverTapNotificationCategory = (appDelegate: string, categoryIdentifier: string, actions: [NotificationAction]): string => {
    const notificationSetupCode = generateNotificationSetupCode(categoryIdentifier, actions);
    appDelegate = appDelegate.replace(
    `[[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];`,
    `${notificationSetupCode}\n [[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];`
    );
  return appDelegate;
}

/**
 * Adds willPresentNotification function
 */
export const addEnablePushInForeground = (appDelegate: string): string => {
  if (appDelegate.includes('@interface AppDelegate () <')) {
    appDelegate = appDelegate.replace(
      `@interface AppDelegate () <`,
      `@interface AppDelegate () < UNUserNotificationCenterDelegate, `
    );
  } else {
    appDelegate = appDelegate.replace(
      `@implementation AppDelegate`,
      `@interface AppDelegate () <UNUserNotificationCenterDelegate> {  }  @end
      @implementation AppDelegate\n`
      );
  }
  appDelegate = appDelegate.replace(
    `@implementation AppDelegate`,
    `\n @implementation AppDelegate \n - (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler{\n completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);\n }\n`
  );
  return appDelegate;
}