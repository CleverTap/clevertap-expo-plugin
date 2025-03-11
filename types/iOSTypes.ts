export type iOS = {
    /**
    * (required) Used to configure APNs environment entitlement. "development" or "production"
    */
    mode: string;
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
    * (optional) This value should be set when client wants to configure remote Push Notifications.
    */
    notifications?: NotificationFeature;
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
    */
    enableRichMedia?: boolean;
    /**
    * (optional) This value should be set to true if user wants to enable Push Impressions. Enable `enableRichMedia` to add CTNotificationService Extension.
    */
    enablePushImpression?: boolean;
    /**
    * (optional) This value should be set to true if user wants to add Notification Content Extension target.
    */
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
    /**
    * (optional) This value should be set to if user wants to log Push Impressions to dashboard.
    */
    iosPushAppGroup?: string;
}

export type NotificationCategory = {
    identifier: string;
    actions?: [NotificationAction];
}

export type NotificationAction = {
    identifier: string;
    title: string;
}