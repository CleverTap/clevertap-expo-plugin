import { ConfigPlugin } from 'expo/config-plugins';
import { CleverTapPluginProps } from '../types/types';
import { withCleverTapAndroidManifest } from './android_config/manifest/withCleverTapAndroidManifest';
import { withClevertapAndroidAppBuildGradle } from './android_config/gradle/withClevertapAndroidAppBuildGradle';

export const withCleverTapAndroid: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    config = withCleverTapAndroidManifest(config, props);
    config = withClevertapAndroidAppBuildGradle(config, props)
    return config;
}
