import { ConfigPlugin } from 'expo/config-plugins';
import { CleverTapPluginProps } from '../types/types';
import { withCleverTapAndroidManifest } from './android_config/manifest/withCleverTapAndroidManifest';

export const withCleverTapAndroid: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    config = withCleverTapAndroidManifest(config, props);
    return config;
}
