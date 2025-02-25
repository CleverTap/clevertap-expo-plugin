import { Android } from "./androidTypes";
import { iOSFeatures } from "./iOSTypes";
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
  
  ios?: iOSFeatures;
  android: Android;
};

enum CleverTapEncryptionLevel {
  None = 0,
  Medium = 1,
}