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
     * (optional) Used to configure Apple Team ID. You can find your Apple Team ID by running expo credentials:manager e.g: "91SW8A37CR"
     */
    devTeam?: string;
  
    /**
     * (optional) Target IPHONEOS_DEPLOYMENT_TARGET value to be used when adding the iOS NSE and NCE. This value should match the value in your Podfile e.g: "12.0".
     */
    iPhoneDeploymentTarget?: string;

    /**
     * (optional) TARGETED_DEVICE_FAMILY value to be used when adding the iOS NSE and NCE eg: "1,2" for iPhone/ iPad.
     */
    deviceFamily?: string;
    /**
     * (optional) The local path to a custom Notification Service Extension (NSE), written in Swift. The NSE will typically start as a copy
     * of the default NSE found at (support/serviceExtensionFiles/NotificationService.swift, then altered to support any custom
     * logic required.
     */
     iosNSEFilePath?:       string;
     /**
     * (optional) The local path to a custom Notification Content Extension (NCE), written in Swift. The NCE will typically start as a copy
     * of the default NCE found at (support/contentExtensionFiles/NotificationViewController.swift, then altered to support any custom
     * logic required.
     */
     iosNCEFilePath?:       string;
     /**
     * (optional) This value should be set to true if user wants to add Notification Service Extension target .
.     */
     enableCleverTapServiceExtension?: boolean;
     /**
     * (optional) This value should be set to true if user wants to add Notification Content Extension target .
.     */
     enableCleverTapContentExtension?: boolean;
  
  };
  
  export const CLEVERTAP_PLUGIN_PROPS: string[] = [
    "accountId",
    "accountToken",
    "accountRegion",
    "devTeam",
    "iPhoneDeploymentTarget",
    "deviceFamily",
    "iosNSEFilePath",
    "iosNCEFilePath",
    "enableCleverTapServiceExtension",
    "enableCleverTapContentExtension"
  ];