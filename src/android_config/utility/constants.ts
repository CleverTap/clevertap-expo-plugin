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
} as const;

export const CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS: Dependencies = {
    clevertapCore: {
        clevertapCoreSdkVersion: '7.1.2',
        androidxCoreVersion: '1.9.0'
    },
    pushNotifications: {
        firebaseMessagingVersion: '23.0.6'
    },
    pushTemplates: {
        clevertapPushTemplatesSdkVersion: '1.2.4'
    },
    inApp: {
        appCompatVersion: '1.6.0-rc01',
        fragmentVersion: '1.3.6'
    },
    inbox: {
        appCompatVersion: '1.6.0-rc01',
        recyclerViewVersion: '1.2.1',
        viewPagerVersion: '1.0.0',
        materialVersion: '1.4.0',
        glideVersion: '4.12.0',
        fragmentVersion: '1.3.6',

    },
    media3: {
        media3Version: '1.1.1'
    },
    installReferrer: {
        installReferrerVersion: '2.2'
    },
    hmsPush: {
        clevertapHmsSdkVersion: '1.3.4',
        hmsPushVersion: '6.11.0.300'
    },
    googleAdId: {
        playServicesAdsVersion: '23.6.0'
    }
};