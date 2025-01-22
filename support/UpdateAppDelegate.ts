import { NotificationAction, NotificationCategory } from "../types/types";

/**
 * Adds CleverTap's auto integrate code 
 */
export const addCleverTapImportsForAutoIntegrate = (appDelegate: string): string => {
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
          `[CleverTap setDebugLevel:${debugLevel}];
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
       `#import "CleverTapURLDelegate.h"\n
@interface AppDelegate () <CleverTapURLDelegate> {  }  @end\n
@implementation AppDelegate\n`
      );
  }
  appDelegate = appDelegate.replace(
    `@implementation AppDelegate`,
    `@implementation AppDelegate \n - (BOOL)shouldHandleCleverTapURL:(NSURL *)url forChannel:(CleverTapChannel)channel { \n  return YES; \n }`
  )
  return appDelegate;
}
/**
 * Update AppDelegate with required CleverTap's notification category code 
 */
export const addCleverTapNotificationCategory = (appDelegate: string, categories?: [NotificationCategory]): string => {
  const notificationSetupCode = generateNotificationCategoriesCode(categories ?? [])
  appDelegate = appDelegate.replace( 
    `[[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];`,
    `${notificationSetupCode}\n [[CleverTapReactManager sharedInstance] applicationDidLaunchWithOptions:launchOptions];`
    );
  return appDelegate;
}

function generateNotificationCategoriesCode(categories: NotificationCategory[]): string {
  let categoriesCode = "";

  categories.forEach((category, categoryIndex) => {
    const actionVariables: string[] = [];

    // Generate actions
    category.actions?.forEach((action, actionIndex) => {
      const actionVar = `action${categoryIndex + 1}${actionIndex + 1}`;
      categoriesCode += `UNNotificationAction *${actionVar} = [UNNotificationAction actionWithIdentifier:@"${action.identifier}" title:@"${action.title}" options:UNNotificationActionOptionNone];\n`;
      actionVariables.push(actionVar);
    });

    // Generate category
    const categoryVar = `category${categoryIndex + 1}`;
    categoriesCode += `UNNotificationCategory *${categoryVar} = [UNNotificationCategory categoryWithIdentifier:@"${category.identifier}" actions:@[${actionVariables.join(
      ", "
    )}] intentIdentifiers:@[] options:UNNotificationCategoryOptionNone];\n\n`;
  });

  // Set categories
  const categoryVariables = categories
    .map((_, index) => `category${index + 1}`)
    .join(", ");
  categoriesCode += `[[UNUserNotificationCenter currentNotificationCenter] setNotificationCategories:[NSSet setWithObjects:${categoryVariables}, nil]];\n`;

  return categoriesCode;
}
/**
 * Update AppDelegate with willPresentNotification function
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
      `@interface AppDelegate () <UNUserNotificationCenterDelegate> {  }  @end\n
@implementation AppDelegate\n`
      );
  }
  appDelegate = appDelegate.replace(
    `@implementation AppDelegate`,
    `@implementation AppDelegate \n
 - (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler{\n completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);\n }\n`
  );
  return appDelegate;
}