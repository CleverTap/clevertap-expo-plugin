import { Android } from "./androidTypes";
import { iOS } from "./iOSTypes";
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
   * (optional) Use to set the encryption level for locally stored data.
   * `0` None, `1` Medium encrypts PII data (Name, Email, Identity, Phone),
   * `2` High encrypts all data including non-PII.
   */
  encryptionLevel?: CleverTapEncryptionLevel;
  /**
   * (optional) Use to enable encryption in transit for all event data sent over the network. Set to true to enable.
   */
  encryptionInTransit?: boolean;
  /**
   * (optional) Use to provide identifiers for setting custom cleverTapID. e.g. "Email,Phone"
   */
  customIdentifiers?: string;

  ios?: iOS;
  android: Android;
};

/**
* Defines the level of encryption applied to data stored by CleverTap.
* None: No encryption is applied. Data is stored in plain text.
* Medium: Encrypts personally identifiable information (PII), including Name, Email, Identity, and Phone.
* High: Encrypts all stored data, including both PII and non-PII data.
*/
enum CleverTapEncryptionLevel {
  None = 0,
  Medium = 1,
  High = 2,
}
