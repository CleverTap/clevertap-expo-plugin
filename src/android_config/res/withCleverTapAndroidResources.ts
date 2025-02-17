import { ConfigPlugin, withStringsXml } from '@expo/config-plugins';
import { CleverTapLog } from '../../../support/CleverTapLog';
import { CleverTapPluginProps } from '../../../types/types';

export const withCleverTapAndroidResources: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    return withStringsXml(config, async (config) => {
        const strings = config.modResults.resources.string || [];

        // Activity Lifecycle Callbacks
        if (props.android?.registerActivityLifecycleCallbacks !== undefined) {
            addOrUpdateString(
                strings,
                'expo_clevertap_register_activity_lifecycle_callbacks',
                String(props.android.registerActivityLifecycleCallbacks)
            );
        }

        // Push Templates
        if (props.android?.features?.enablePushTemplates !== undefined) {
            addOrUpdateString(
                strings,
                'expo_clevertap_enable_push_templates',
                String(props.android.features.enablePushTemplates)
            );
        }

        // Log Level
        if (props.logLevel !== undefined) {
            addOrUpdateString(
                strings,
                'expo_clevertap_log_level',
                String(props.logLevel)
            );
        }

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