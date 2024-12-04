export const IPHONEOS_DEPLOYMENT_TARGET = "11.0"; //Used as default value
export const TARGETED_DEVICE_FAMILY = `"1,2"`; //Used as default value

export const DEFAULT_BUNDLE_VERSION = '1';
export const DEFAULT_BUNDLE_SHORT_VERSION = '1.0';
export const TARGET_PODFILE_REGEX = /clevertap-react-native/;
export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;


//iOS Notification Service Extension
export const NSE_TARGET_NAME = "CTNotificationServiceExtension";
export const NSE_SOURCE_FILE = "NotificationService.swift"
export const NSE_EXT_FILES = [
  `${NSE_TARGET_NAME}-Info.plist`
];
export const NSE_PODFILE_SNIPPET = `
target 'CTNotificationServiceExtension' do
pod 'CleverTap-iOS-SDK', :modular_headers => true
pod 'CTNotificationService', :modular_headers => true
use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;
export const NSE_PODFILE_REGEX = /target 'CTNotificationServiceExtension'/;

//iOS Notification Content Extension
export const NCE_TARGET_NAME = "CTNotificationContentExtension";
export const NCE_PODFILE_SNIPPET = `
target 'CTNotificationContentExtension' do
pod 'CleverTap-iOS-SDK', :modular_headers => true
pod 'CTNotificationContent'
use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;
export const NCE_SOURCE_FILE = "NotificationViewController.swift"
export const NCE_EXT_FILES = [
  `MainInterface.storyboard`,
  `${NCE_TARGET_NAME}-Info.plist`
];
export const NCE_PODFILE_REGEX = /target 'CTNotificationContentExtension'/;