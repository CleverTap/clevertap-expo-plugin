import { ConfigPlugin } from '@expo/config-plugins';
import { CleverTapPluginProps } from "../types/types";
import { withCleverTapIos } from './withClevertapIos';
import { withCleverTapAndroid } from './withCleverTapAndroid';

const withClevertap: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    // if props are undefined, throw error
    if (!props) {
      throw new Error(   
        'You are trying to use the CleverTap plugin without any props.'
      );
    }

  if (!props.accountId) {
    throw new Error('CleverTap accountId is required but was not specified in the config');
  }
  if (!props.accountToken) {
    throw new Error('CleverTap accountToken is required but was not specified in the config');
  }
    config = withCleverTapAndroid(config, props);  
    config = withCleverTapIos(config, props);  
    return config;
  };
  
  export default withClevertap;