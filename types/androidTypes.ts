export interface Android{
    features : Features;
    customNotificationSound?: string;
    customIdentifiers?: string;  // e.g., "Email,Phone"
    backgroundSync?: string;
    defaultNotificationChannelId?: string;
    inAppExcludeActivities?: string;  // Comma-separated activity names
    proxyDomain?: string;   // e.g., "analytics.sdktesting.xyz"
    spikyProxyDomain?: string;  // e.g., "spiky-analytics.sdktesting.xyz"
    encryptionLevel?: string;  // "0" or "1"
    sslPinning?: string;  // "0" or "1"
    useCustomId?: string;  //"0" or "1"
    handshakeDomain?: string;
    disableAppLaunched?: string;  // "0" or "1"
    intentServiceName?: string;
    registerActivityLifecycleCallbacks?: boolean;
}
export interface Features {
    
    enablePush?: boolean;
    enablePushTemplates?: boolean;
    enableInApp?: boolean;
    enableInbox?: boolean;
    enableMediaForInAppsInbox?: boolean;
    enableInstallReferrer?: boolean;
    enableHmsPush?: boolean;
    enableGoogleAdId?: boolean;
}
export interface Dependencies {
    clevertapCore: {
        clevertapSdkVersion: string;
        androidxCoreVersion: string;
    };
    pushNotifications: {
        firebaseMessagingVersion: string;
    };
    pushTemplates: {
        pushTemplatesVersion: string;
    };
    inApp: {
        appCompatVersion: string;
        fragmentVersion: string;
    };
    inbox: {
        appCompatVersion: string;
        recyclerViewVersion: string;
        viewPagerVersion: string;
        materialVersion: string;
        glideVersion: string;
        fragmentVersion: string;
    };
    media3: {
        version: string;
    };
    installReferrer: {
        version: string;
    };
    hmsPush: {
        clevertapHmsSdkVersion: string;
        hmsPushVersion: string;
    };
    googleAdId: {
        version: string;
    };
}