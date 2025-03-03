import { CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS as VERSIONS, CLEVERTAP_GRADLE_PROPERTIES_KEYS as KEYS } from './constants';

// Helper function for property checks
const getPropertyCheck = (propertyKey: string): string =>
    `project.hasProperty('${propertyKey}') && project.${propertyKey}.toBoolean()`;

// Helper function for version property retrieval
const getVersionProperty = (propertyKey: string): string => {
    let defaultValue = '';

    // Map property keys to their default values
    switch (propertyKey) {
        case KEYS.CLEVERTAP_SDK_VERSION:
            defaultValue = VERSIONS.clevertapCore?.clevertapCoreSdkVersion || '';
            break;
        case KEYS.ANDROIDX_CORE_VERSION:
            defaultValue = VERSIONS.clevertapCore?.androidxCoreVersion || '';
            break;
        case KEYS.FIREBASE_MESSAGING_VERSION:
            defaultValue = VERSIONS.pushNotifications?.firebaseMessagingVersion || '';
            break;
        case KEYS.PUSH_TEMPLATES_VERSION:
            defaultValue = VERSIONS.pushTemplates?.clevertapPushTemplatesSdkVersion || '';
            break;
        case KEYS.APP_COMPAT_VERSION:
            defaultValue = VERSIONS.inApp?.appCompatVersion || VERSIONS.inbox?.appCompatVersion || '';
            break;
        case KEYS.RECYCLERVIEW_VERSION:
            defaultValue = VERSIONS.inbox?.recyclerViewVersion || '';
            break;
        case KEYS.VIEWPAGER_VERSION:
            defaultValue = VERSIONS.inbox?.viewPagerVersion || '';
            break;
        case KEYS.MATERIAL_VERSION:
            defaultValue = VERSIONS.inbox?.materialVersion || '';
            break;
        case KEYS.GLIDE_VERSION:
            defaultValue = VERSIONS.inbox?.glideVersion || '';
            break;
        case KEYS.FRAGMENT_VERSION:
            defaultValue = VERSIONS.inApp?.fragmentVersion || VERSIONS.inbox?.fragmentVersion || '';
            break;
        case KEYS.MEDIA3_VERSION:
            defaultValue = VERSIONS.media3?.version || '';
            break;
        case KEYS.INSTALL_REFERRER_VERSION:
            defaultValue = VERSIONS.installReferrer?.version || '';
            break;
        case KEYS.CLEVERTAP_HMS_SDK_VERSION:
            defaultValue = VERSIONS.hmsPush?.clevertapHmsSdkVersion || '';
            break;
        case KEYS.HMS_PUSH_VERSION:
            defaultValue = VERSIONS.hmsPush?.hmsPushVersion || '';
            break;
        case KEYS.PLAY_SERVICES_ADS_VERSION:
            defaultValue = VERSIONS.googleAdId?.version || '';
            break;
    }

    return `$\{project.findProperty('${propertyKey}') ?: '${defaultValue}'\}`;
};

const generateCoreDependencies = () => `
    // Core features
    implementation("com.clevertap.android:clevertap-android-sdk:${getVersionProperty(KEYS.CLEVERTAP_SDK_VERSION)}")
    implementation("androidx.core:core:${getVersionProperty(KEYS.ANDROIDX_CORE_VERSION)}")`;

const generatePushDependencies = () => `
    // Push notifications
    if (${getPropertyCheck(KEYS.PUSH_ENABLED)}) {
        implementation("com.google.firebase:firebase-messaging:${getVersionProperty(KEYS.FIREBASE_MESSAGING_VERSION)}")
    }`;

const generatePushTemplatesDependencies = () => `
    // Push templates
    if (${getPropertyCheck(KEYS.PUSH_TEMPLATES_ENABLED)}) {
        implementation("com.clevertap.android:push-templates:${getVersionProperty(KEYS.PUSH_TEMPLATES_VERSION)}")
    }`;

const generateInAppDependencies = () => `
    // InApp features
    if (${getPropertyCheck(KEYS.IN_APP_ENABLED)}) {
        implementation("androidx.appcompat:appcompat:${getVersionProperty(KEYS.APP_COMPAT_VERSION)}")
        implementation("androidx.fragment:fragment:${getVersionProperty(KEYS.FRAGMENT_VERSION)}")
    }`;

const generateInboxDependencies = () => `
    // InApp/Inbox features
    if (${getPropertyCheck(KEYS.INBOX_ENABLED)}) {
        implementation("androidx.appcompat:appcompat:${getVersionProperty(KEYS.APP_COMPAT_VERSION)}")
        implementation("androidx.recyclerview:recyclerview:${getVersionProperty(KEYS.RECYCLERVIEW_VERSION)}")
        implementation("androidx.viewpager:viewpager:${getVersionProperty(KEYS.VIEWPAGER_VERSION)}")
        implementation("com.google.android.material:material:${getVersionProperty(KEYS.MATERIAL_VERSION)}")
        implementation("com.github.bumptech.glide:glide:${getVersionProperty(KEYS.GLIDE_VERSION)}")
        implementation("androidx.fragment:fragment:${getVersionProperty(KEYS.FRAGMENT_VERSION)}")

        // Optional ExoPlayer Libraries
        if (${getPropertyCheck(KEYS.MEDIA_ENABLED)}) {
            implementation("androidx.media3:media3-exoplayer:${getVersionProperty(KEYS.MEDIA3_VERSION)}")
            implementation("androidx.media3:media3-exoplayer-hls:${getVersionProperty(KEYS.MEDIA3_VERSION)}")
            implementation("androidx.media3:media3-ui:${getVersionProperty(KEYS.MEDIA3_VERSION)}")
        }
    }`;

const generateInstallReferrerDependencies = () => `
    // Install Referrer
    if (${getPropertyCheck(KEYS.INSTALL_REFERRER_ENABLED)}) {
        implementation("com.android.installreferrer:installreferrer:${getVersionProperty(KEYS.INSTALL_REFERRER_VERSION)}")
    }`;

const generateHmsPushDependencies = () => `
    // HMS Push
    if (${getPropertyCheck(KEYS.HMS_PUSH_ENABLED)}) {
        implementation("com.clevertap.android:clevertap-hms-sdk:${getVersionProperty(KEYS.CLEVERTAP_HMS_SDK_VERSION)}")
        implementation("com.huawei.hms:push:${getVersionProperty(KEYS.HMS_PUSH_VERSION)}")
    }`;

const generateGoogleAdIdDependencies = () => `
    // Google Ad ID
    if (${getPropertyCheck(KEYS.GOOGLE_AD_ID_ENABLED)}) {
        implementation("com.google.android.gms:play-services-ads:${getVersionProperty(KEYS.PLAY_SERVICES_ADS_VERSION)}")
    }`;

export const generateDependenciesTemplate = (): string => {
    const sections = [
        generateCoreDependencies(),
        generatePushDependencies(),
        generatePushTemplatesDependencies(),
        generateInAppDependencies(),
        generateInboxDependencies(),
        generateInstallReferrerDependencies(),
        generateHmsPushDependencies(),
        generateGoogleAdIdDependencies()
    ];

    return sections.join('\n');
};

export const generateFirebasePluginTemplate = (): string => `
// @clevertap-firebase-plugin-begin
apply plugin: "com.google.gms.google-services"
// @clevertap-firebase-plugin-end
`;

export const generateHmsPluginTemplate = (): string => `
// @clevertap-hms-plugin-begin
apply plugin: "com.huawei.agconnect"
// @clevertap-hms-plugin-end
`;