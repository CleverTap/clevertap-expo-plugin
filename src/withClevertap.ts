import { ConfigPlugin } from '@expo/config-plugins';
import { CleverTapPluginProps } from "../types/types";
import { withCleverTapIos } from './withClevertapIos';

const withClevertap: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
    // if props are undefined, throw error
    if (!props) {
      throw new Error(   
        'You are trying to use the CleverTap plugin without any props.'
      );
    }
  
    config = withCleverTapIos(config, props);  
    return config;
  };
  
  export default withClevertap;