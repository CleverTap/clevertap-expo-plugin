import { ConfigPlugin, withStringsXml } from '@expo/config-plugins';
import { CleverTapLog } from '../../../support/CleverTapLog';
import { CleverTapPluginProps } from '../../../types/types';

const DEFAULT_VALUES = {
    registerActivityLifecycleCallbacks: 'true',
    enablePushTemplates: 'false',
    logLevel: '-1'
} as const;

const STRING_KEYS = {
    registerActivityLifecycleCallbacks: 'expo_clevertap_register_activity_lifecycle_callbacks',
    enablePushTemplates: 'expo_clevertap_enable_push_templates',
    logLevel: 'expo_clevertap_log_level'
} as const;

export const withCleverTapAndroidResources: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    return withStringsXml(config, async (config) => {
        const strings = config.modResults.resources.string || [];

        // Activity Lifecycle Callbacks
        const lifecycleCallbacks = props?.android?.registerActivityLifecycleCallbacks !== undefined 
            ? String(props.android.registerActivityLifecycleCallbacks)
            : DEFAULT_VALUES.registerActivityLifecycleCallbacks;
        
        addOrUpdateString(
            strings,
            STRING_KEYS.registerActivityLifecycleCallbacks,
            lifecycleCallbacks
        );

        // Push Templates
        const pushTemplates = props?.android?.features?.enablePushTemplates !== undefined
            ? String(props.android.features.enablePushTemplates)
            : DEFAULT_VALUES.enablePushTemplates;
        
        addOrUpdateString(
            strings,
            STRING_KEYS.enablePushTemplates,
            pushTemplates
        );

        // Log Level
        const logLevel = props?.logLevel !== undefined
            ? String(props.logLevel)
            : DEFAULT_VALUES.logLevel;
        
        addOrUpdateString(
            strings,
            STRING_KEYS.logLevel,
            logLevel
        );
        config.modResults.resources.string = strings;
        
        // Log what resources were added for debugging
        CleverTapLog.log('Added CleverTap resources to strings.xml');
        
        return config;
    });
};

const addOrUpdateString = (
    strings: any[],
    name: string,
    value: string
) => {
    const existingIndex = strings.findIndex(
        resource => resource.$?.name === name
    );

    if (existingIndex !== -1) {
        // String exists, check if value is different
        if (strings[existingIndex]._ !== value) {
            strings[existingIndex]._ = value;
            CleverTapLog.log(`Updated string ${name} with value ${value}`);
        }
    } else {
        // String doesn't exist, add it
        strings.push({
            $: {
                name,
                translatable: 'false'
            },
            _: value
        });
        CleverTapLog.log(`Added new string ${name} with value ${value}`);
    }
};