import { Dependencies } from "../../../types/androidTypes";

export const CLEVERTAP_GRADLE_PROPERTIES_KEYS = {
    // Feature flags keys for gradle.properties
    CORE_ENABLED: 'clevertapCoreEnabled',
    PUSH_ENABLED: 'clevertapPushEnabled',
    PUSH_TEMPLATES_ENABLED: 'clevertapPushTemplatesEnabled',
    IN_APP_ENABLED: 'clevertapInAppEnabled',
    INBOX_ENABLED: 'clevertapInboxEnabled',
    MEDIA_ENABLED: 'clevertapMediaForInAppsInboxEnabled',
    INSTALL_REFERRER_ENABLED: 'clevertapInstallReferrerEnabled',
    HMS_PUSH_ENABLED: 'clevertapHmsPushEnabled',
    GOOGLE_AD_ID_ENABLED: 'clevertapGoogleAdIdEnabled',
    PLAY_REVIEW_ENABLED: 'clevertapPlayReviewEnabled',

    // Dependency version keys for gradle.properties
    CLEVERTAP_SDK_VERSION: 'clevertapCoreSdkVersion',
    ANDROIDX_CORE_VERSION: 'androidxCoreVersion',
    FIREBASE_MESSAGING_VERSION: 'firebaseMessagingVersion',
    PUSH_TEMPLATES_VERSION: 'clevertapPushTemplatesSdkVersion',
    APP_COMPAT_VERSION: 'appCompatVersion',
    RECYCLERVIEW_VERSION: 'recyclerViewVersion',
    VIEWPAGER_VERSION: 'viewPagerVersion',
    MATERIAL_VERSION: 'materialVersion',
    GLIDE_VERSION: 'glideVersion',
    FRAGMENT_VERSION: 'fragmentVersion',
    MEDIA3_VERSION: 'media3Version',
    INSTALL_REFERRER_VERSION: 'installReferrerVersion',
    CLEVERTAP_HMS_SDK_VERSION: 'clevertapHmsSdkVersion',
    HMS_PUSH_VERSION: 'hmsPushVersion',
    PLAY_SERVICES_ADS_VERSION: 'playServicesAdsVersion',
    PLAY_REVIEW_VERSION: 'playReviewVersion',
} as const;

export const CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS: Dependencies = {
    clevertapCore: {
        clevertapCoreSdkVersion: '8.0.0',
        androidxCoreVersion: '1.13.0'
    },
    pushNotifications: {
        firebaseMessagingVersion: '24.0.0'
    },
    pushTemplates: {
        clevertapPushTemplatesSdkVersion: '2.2.0'
    },
    inApp: {
        appCompatVersion: '1.7.0',
        fragmentVersion: '1.5.4'
    },
    inbox: {
        appCompatVersion: '1.7.0',
        recyclerViewVersion: '1.3.2',
        viewPagerVersion: '1.0.0',
        materialVersion: '1.12.0',
        glideVersion: '4.12.0',
        fragmentVersion: '1.5.4',

    },
    media3: {
        media3Version: '1.4.0'
    },
    installReferrer: {
        installReferrerVersion: '2.2'
    },
    hmsPush: {
        clevertapHmsSdkVersion: '1.5.0',
        hmsPushVersion: '6.11.0.300'
    },
    googleAdId: {
        playServicesAdsVersion: '18.2.0'
    },
    playReview: {
        playReviewVersion: '2.0.2'
    }
};