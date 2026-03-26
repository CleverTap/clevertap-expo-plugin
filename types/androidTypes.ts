export interface Android{
    features : Features;
    notificationIcon?: string;  // Path to notification icon PNG (e.g. "./assets/notification-icon.png")
    customNotificationSound?: string | string[];
    backgroundSync?: string;
    defaultNotificationChannelId?: string;
    inAppExcludeActivities?: string;  // Comma-separated activity names
    sslPinning?: string;  // "0" or "1"
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
    enablePlayReview?: boolean;
}
export interface Dependencies {
    clevertapCore: {
        clevertapCoreSdkVersion: string;
        androidxCoreVersion: string;
    };
    pushNotifications: {
        firebaseMessagingVersion: string;
    };
    pushTemplates: {
        clevertapPushTemplatesSdkVersion: string;
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
        media3Version: string;
    };
    installReferrer: {
        installReferrerVersion: string;
    };
    hmsPush: {
        clevertapHmsSdkVersion: string;
        hmsPushVersion: string;
    };
    googleAdId: {
        playServicesAdsVersion: string;
    };
    playReview: {
        playReviewVersion: string;
    };
}