import { AndroidConfig, ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';
import { ExpoConfig } from 'expo/config';
import { CleverTapPluginProps } from '../../../types/types';
import { CleverTapLog } from "../../../support/CleverTapLog";


// Using helpers keeps error messages unified and helps cut down on XML format changes.
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow, removeMetaDataItemFromMainApplication } = AndroidConfig.Manifest;
const { addPermission, removePermissions } = AndroidConfig.Permissions
const FCM_SERVICE_NAME = 'com.clevertap.android.sdk.pushnotification.fcm.FcmMessageListenerService';

export const withCleverTapAndroidManifest: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    return withAndroidManifest(config, async config => {
        // Modifiers can be async, but try to keep them fast.
        config.modResults = await setManifestConfigAsync(config, config.modResults, props);
        return config;
    });
};

async function setManifestConfigAsync(
    config: ExpoConfig, androidManifest: AndroidConfig.Manifest.AndroidManifest, props: CleverTapPluginProps): Promise<AndroidConfig.Manifest.AndroidManifest> {
    // Get the <application /> tag and assert if it doesn't exist.
    const mainApplication = getMainApplicationOrThrow(androidManifest);
    // Add all metadata configurations
    METADATA_CONFIGS.forEach(metadataConfig => {
        handleMetadata(mainApplication, androidManifest, metadataConfig, props, config);
    });

    // Add FCM service if push is enabled
    if (props.android?.features?.enablePush) {
        addFCMService(mainApplication);
    } else {
        removeFCMService(mainApplication);
    }

    return androidManifest;
}

interface MetadataConfig {
    key: string;
    getValue: (props: CleverTapPluginProps, config?: ExpoConfig) => string | undefined;
    onAdd?: (props: CleverTapPluginProps, androidManifest: AndroidConfig.Manifest.AndroidManifest) => void;
    onRemove?: (androidManifest: AndroidConfig.Manifest.AndroidManifest) => void;
}

const METADATA_CONFIGS: MetadataConfig[] = [
    {
        key: 'CLEVERTAP_ACCOUNT_ID',
        getValue: (props) => props.accountId
    },
    {
        key: 'CLEVERTAP_TOKEN',
        getValue: (props) => props.accountToken
    },
    {
        key: 'CLEVERTAP_REGION',
        getValue: (props) => props.accountRegion
    },
    {
        key: 'CLEVERTAP_USE_GOOGLE_AD_ID',
        getValue: (props) => props.android?.features?.enableGoogleAdId ? "1" : undefined,
        onAdd: (_, androidManifest) => {
            addPermission(androidManifest, "com.google.android.gms.permission.AD_ID");
        },
        onRemove: (androidManifest) => {
            removePermissions(androidManifest, ["com.google.android.gms.permission.AD_ID"])
        }
    },
    {
        key: 'CLEVERTAP_IDENTIFIER',
        getValue: (props) => props.android?.customIdentifiers
    },
    {
        key: 'CLEVERTAP_NOTIFICATION_ICON',
        getValue: (_, config) => config?.notification?.icon ? 'notification_icon.png' : undefined
    },
    {
        key: 'CLEVERTAP_BACKGROUND_SYNC',
        getValue: (props) => props.android?.backgroundSync
    },
    {
        key: 'CLEVERTAP_DEFAULT_CHANNEL_ID',
        getValue: (props) => props.android?.defaultNotificationChannelId
    },
    {
        key: 'CLEVERTAP_INAPP_EXCLUDE',
        getValue: (props) => props.android?.inAppExcludeActivities
    },
    {
        key: 'CLEVERTAP_PROXY_DOMAIN',
        getValue: (props) => props.proxyDomain
    },
    {
        key: 'CLEVERTAP_SPIKY_PROXY_DOMAIN',
        getValue: (props) => props.spikyProxyDomain
    },
    {
        key: 'CLEVERTAP_ENCRYPTION_LEVEL',
        getValue: (props) => props.encryptionLevel?.toString()
    },
    {
        key: 'CLEVERTAP_SSL_PINNING',
        getValue: (props) => props.android?.sslPinning?.toString()
    },
    {
        key: 'CLEVERTAP_USE_CUSTOM_ID',
        getValue: (props) => props.android?.useCustomId?.toString()
    },
    {
        key: 'CLEVERTAP_HANDSHAKE_DOMAIN',
        getValue: (props) => props.handshakeDomain
    },
    {
        key: 'CLEVERTAP_DISABLE_APP_LAUNCHED',
        getValue: (props) => typeof props.disableAppLaunchedEvent !== 'undefined' ? 
        (props.disableAppLaunchedEvent ? "1" : "0") : 
        undefined
    },
    {
        key: 'CLEVERTAP_INTENT_SERVICE',
        getValue: (props) => props.android?.intentServiceName
    }
];

const handleMetadata = (
    mainApplication: AndroidConfig.Manifest.ManifestApplication,
    androidManifest: AndroidConfig.Manifest.AndroidManifest,
    metaDataConfig: MetadataConfig,
    props: CleverTapPluginProps,
    expoConfig?: ExpoConfig
) => {
    const value = metaDataConfig.getValue(props, expoConfig);
    if (value) {
        addMetaDataItemToMainApplication(mainApplication, metaDataConfig.key, value);
        metaDataConfig.onAdd?.(props, androidManifest);
    } else {
        removeMetaDataItemFromMainApplication(mainApplication, metaDataConfig.key);
        metaDataConfig.onRemove?.(androidManifest);
    }
};

const addFCMService = (mainApplication: AndroidConfig.Manifest.ManifestApplication) => {
     
    mainApplication.service = mainApplication.service || [];
    
    const serviceExists = mainApplication.service.some(service => 
        service.$?.['android:name'] === FCM_SERVICE_NAME
    );

    if (!serviceExists) {
        mainApplication.service.push({
            $: {
                'android:name': FCM_SERVICE_NAME,
                'android:exported': 'true'
            },
            'intent-filter': [{
                action: [{
                    $: {
                        'android:name': 'com.google.firebase.MESSAGING_EVENT'
                    }
                }]
            }]
        });
        CleverTapLog.log('Added FCM Message Listener Service to AndroidManifest.xml');
    } else {
        CleverTapLog.log('FCM Message Listener Service already exists in AndroidManifest.xml');
    }
};

const removeFCMService = (mainApplication: AndroidConfig.Manifest.ManifestApplication) => {
    
    if (mainApplication.service) {
        mainApplication.service = mainApplication.service.filter(service => 
            service.$?.['android:name'] !== FCM_SERVICE_NAME
        );
        CleverTapLog.log('Removed FCM Message Listener Service from AndroidManifest.xml');
    }
};