import { AndroidConfig } from '@expo/config-plugins';
import { Dependencies, Features } from '../../../types/androidTypes';
import { CLEVERTAP_GRADLE_PROPERTIES_KEYS as KEYS } from './constants';

export const createGradleProperty = (
    key: string,
    value: string
): AndroidConfig.Properties.PropertiesItem => ({
    type: "property",
    key,
    value
});

export const createVersionProperties = (
    versions: Dependencies
): AndroidConfig.Properties.PropertiesItem[] => {
    const properties: AndroidConfig.Properties.PropertiesItem[] = [];

    Object.keys(versions).forEach(key => {
        const versionObj = versions[key as keyof Dependencies];
        Object.entries(versionObj).forEach(([propKey, value]) => {
            properties.push(createGradleProperty(propKey, value));
        });
    });

    return properties;
};

export const createFeatureProperties = (features: Features): AndroidConfig.Properties.PropertiesItem[] => {
    return [
        createGradleProperty(KEYS.CORE_ENABLED, "true"),
        createGradleProperty(KEYS.PUSH_ENABLED, String(features.enablePush)),
        createGradleProperty(KEYS.PUSH_TEMPLATES_ENABLED, String(features.enablePushTemplates)),
        createGradleProperty(KEYS.IN_APP_ENABLED, String(features.enableInApp)),
        createGradleProperty(KEYS.INBOX_ENABLED, String(features.enableInbox)),
        createGradleProperty(KEYS.MEDIA_ENABLED, String(features.enableMediaForInAppsInbox)),
        createGradleProperty(KEYS.INSTALL_REFERRER_ENABLED, String(features.enableInstallReferrer)),
        createGradleProperty(KEYS.HMS_PUSH_ENABLED, String(features.enableHmsPush)),
        createGradleProperty(KEYS.GOOGLE_AD_ID_ENABLED, String(features.enableGoogleAdId))

    ];
};