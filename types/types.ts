/**
 * CleverTapPluginProps refer to the properties set by the user in their app config file (e.g: app.json)
 */
export type CleverTapPluginProps = {
  /**
   * (required) The CleverTapAccountId is available as Project ID on the CleverTap dashboard.
   */
  accountId: string;
  /**
   * (required) The CleverTapToken is available as Project Token on the CleverTap dashboard.
   */
  accountToken: string;
  /**
   * (optional) Use region code e.g: "in1", us1 etc
   */
  accountRegion?: string;
  /**
   * (optional) Use to set custom proxy domain e.g: "analytics.sdktesting.xyz".
   */
  proxyDomain?: string;
  /**
   * (optional) Use to set spiky proxy domain for handling push impression events. e.g: "spiky-analytics.sdktesting.xyz".
   */
  spikyProxyDomain?: string;
  /**
   * (optional) Use to configure CleverTap logs.
   */
  logLevel?: number;
  /**
   * (optional) Use to disable `App Launched` event.
   */
  disableAppLaunchedEvent?: boolean;
  /**
   * (optional) Use to setup custom handshake domain.
   */
  handshakeDomain?: string;
  /**
   * (optional) Use to set encryption level for PII data.
   */
  encryptionLevel?: CleverTapEncryptionLevel;
  /**
   * (optional) Use to set encryption level for PII data.
   */
  ios?: iOSFeatures;
};

export type iOSFeatures = {
  /**
  * (required) Used to configure APNs environment entitlement. "development" or "production"
  */
  mode: string;
  /**
  * (optional) Target DEPLOYMENT_TARGET value to be used when adding the iOS NSE and NCE. This value should match the value in your Podfile e.g: "12.0".
  */
  deploymentTarget?: string;
  /**
  * (optional) TARGETED_DEVICE_FAMILY value to be used when adding the iOS NSE and NCE eg: "1,2" for iPhone/ iPad.
  */
  deviceFamily?: string;
  /**
  * (optional) Use to disable the generation of CleverTap ID.
  */
  disableIDFV?: boolean;
  /**
  * (optional) Use to enable file protection level `NSDataWritingFileProtectionComplete`.
  */
  enableFileProtection?: boolean;
  /**
  * (optional) This value should be set when client wants to handle custom deeplink / external URL.
  */
  enableURLDelegateChannels?: [number];
  /**
  * (optional) This value should be set when client wants to use Custom Templates.
  */
  templateIdentifiers?: CustomTemplate;
  /**
  * (optional) This value should be set when client wants to configure remote Push Notifications.
  */
  notifications: NotificationFeature;
  /**
   * (optional) This value should be set to push client profile properties to record `Push Impression`.
.  */
  profileProps?: Profile;
}

export type NotificationFeature = {
  /**
   * (optional) This value should be set when client wants to use notification category.
   */
  notificationCategories?: [NotificationCategory];
  /**
   * (optional) This value should be set when client wants to receive push notifications in the foreground.
   */
  enablePushInForeground?: boolean;
  /**
   * (optional) This value should be set to true if user wants to integrate CTNotificationService Extension. Client will be able to use Rich Push from dashboard.
.  */
  enableRichMedia?: boolean;
  /**
   * (optional) This value should be set to true if user wants to enable Push Impressions. Enable `enableRichMedia` to add CTNotificationService Extension.
 . */
  enablePushImpression?: boolean;
  /**
   * (optional) This value should be set to true if user wants to add Notification Content Extension target.
 . */
  enablePushTemplate?: boolean;
  /**
   * (optional) The local path to a custom Notification Service Extension (NSE), written in Swift. The NSE will typically start as a copy
   * of the default NSE found at (support/serviceExtensionFiles/NotificationService.swift, then altered to support any custom
   * logic required.
   */
  iosNSEFilePath?: string;
  /**
   * (optional) The local path to a custom Notification Content Extension (NCE), written in Swift. The NCE will typically start as a copy
   * of the default NCE found at (support/contentExtensionFiles/NotificationViewController.swift, then altered to support any custom
   * logic required.
   */
  iosNCEFilePath?: string;
}

export type CustomTemplate = {
  source: string;
  destination: string;
  templates: [string];
}

export type NotificationCategory = {
  identifier: string;
  actions?: [NotificationAction];
}

export type NotificationAction = {
  identifier: string;
  title: string;
}

export type Profile = {
  name: string;
  identity: number;
  email: string;
}

enum CleverTapEncryptionLevel {
  None = 0,
  Medium = 1,
}

export const CLEVERTAP_PLUGIN_PROPS: string[] = [
  "accountId",
  "accountToken",
  "accountRegion",
  "proxyDomain",
  "spikyProxyDomain",
  "logLevel",
  "disableAppLaunchedEvent",
  "handshakeDomain",
  "encryptionLevel",
  "ios"
];