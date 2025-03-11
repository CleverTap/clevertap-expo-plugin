// withClevertapSDK.ts
import { ConfigPlugin, withGradleProperties, withAppBuildGradle } from '@expo/config-plugins';
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { generateDependenciesTemplate, generateFirebasePluginTemplate, generateHmsPluginTemplate } from '../utility/androidAppDepsTemplate';

import { createFeatureProperties, createVersionProperties } from '../utility/utils';
import { CleverTapLog } from '../../../support/CleverTapLog';
import { CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS } from '../utility/constants';
import { CleverTapPluginProps } from '../../../types/types';


export const withClevertapAndroidAppBuildGradle: ConfigPlugin<CleverTapPluginProps> = (
    config,
    {
        android: {
            features: {
                enablePush = false,
                enablePushTemplates = false,
                enableInApp = false,
                enableInbox = false,
                enableMediaForInAppsInbox = false,
                enableInstallReferrer = false,
                enableHmsPush = false,
                enableGoogleAdId = false
            } = {} // Default empty object for features
        } = {} }) => {
    // Modify build.gradle
    config = withAppBuildGradle(config, (config) => {
        const dependenciesTemplate = generateDependenciesTemplate();

        config.modResults.contents = mergeContents({
            src: config.modResults.contents,
            newSrc: dependenciesTemplate,
            tag: 'clevertap-sdk-dependencies',
            comment: '//',
            anchor: /dependencies\s*{/,
            offset: 1
        }).contents;

        // Add a newline if needed
        if (!config.modResults.contents.endsWith('\n')) {
            config.modResults.contents += '\n';
        }

        // Add Firebase plugin at the end if FCM is enabled and plugin not present
        if (enablePush && !config.modResults.contents.includes('com.google.gms.google-services')) {
            config.modResults.contents += generateFirebasePluginTemplate();
        }

        // Add HMS plugin at the end if HMS push is enabled and plugin not present
        if (enableHmsPush && !config.modResults.contents.includes('com.huawei.agconnect')) {
            config.modResults.contents += generateHmsPluginTemplate();
        }

        return config;
    });

    // Modify gradle.properties
    config = withGradleProperties(config, (config) => {
        const featureProperties = createFeatureProperties({
            enablePush,
            enablePushTemplates,
            enableInApp,
            enableInbox,
            enableMediaForInAppsInbox,
            enableInstallReferrer,
            enableHmsPush,
            enableGoogleAdId
        });

        const versionProperties = createVersionProperties(CLEVERTAP_DEPENDENCIES_DEFAULT_VERSIONS);

        const newProperties = [...featureProperties, ...versionProperties];

        const findExistingProperty = (key: string) =>
            config.modResults.find(property =>
                property.type === 'property' && property.key === key
            );

        newProperties.forEach(newProperty => {

            if (newProperty.type === 'property') {
                const existingProperty = findExistingProperty(newProperty.key);

                if (!existingProperty) {
                    config.modResults.push(newProperty);
                } else if (existingProperty.type === 'property' &&
                    existingProperty.value !== newProperty.value) {
                    existingProperty.value = newProperty.value;
                }
            }
        });
        CleverTapLog.log(`featureProps = ${JSON.stringify(featureProperties)}`)

        return config;
    });
    return config;
};