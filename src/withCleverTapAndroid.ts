import { ConfigPlugin } from 'expo/config-plugins';
import { CleverTapPluginProps } from '../types/types';
import { withCleverTapAndroidManifest } from './android_config/manifest/withCleverTapAndroidManifest';
import { withClevertapAndroidAppBuildGradle } from './android_config/gradle/withClevertapAndroidAppBuildGradle';
import { withCleverTapRootGradlePlugin } from './android_config/gradle/withCleverTapAndroidAppRootBuildGradle';
import { withCustomNotificationSound, withHuaweiConfig } from './android_config/io/withCleverTapAndroidCopyFiles';

export const withCleverTapAndroid: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    if (props.android?.features?.enableHmsPush) {
        config = withHuaweiConfig(config, props);
    }
    if (props.android?.customNotificationSound) {
        config = withCustomNotificationSound(config, props);
    }
    config = withCleverTapAndroidManifest(config, props);
    config = withClevertapAndroidAppBuildGradle(config, props)
    config = withCleverTapRootGradlePlugin(config, props)
    return config;
}
