import {
    ConfigPlugin,
    withDangerousMod
  } from "@expo/config-plugins";
import * as path from 'path';
import * as fs from "fs-extra";
import { CleverTapPluginProps } from "../../types/types";
import { CleverTapLog } from "../../support/CleverTapLog";
import {
    TARGET_PODFILE_REGEX,
    NSE_PODFILE_SNIPPET,
    NCE_PODFILE_SNIPPET,
    NCE_PODFILE_REGEX,
    NSE_PODFILE_REGEX
} from "../../support/IOSConstants";
/**
* Add pod for CleverTap, CTNotificationServiceExtension and CTNotificationContentExtension
*/
export const withCleverTapPod: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      // Check if Podfile exists
      if (!fs.existsSync(podfilePath)) {
        throw new Error(`Could not locate Podfile at ${podfilePath}`);
      }

      // Read the Podfile
      let podfileContents = fs.readFileSync(podfilePath, 'utf-8');
      // Add CleverTap's React native dependency if it doesn't already exist
      if (!podfileContents.match(TARGET_PODFILE_REGEX)) {
        podfileContents = podfileContents.replace(
          `use_expo_modules!`,
          `use_expo_modules!
             pod 'clevertap-react-native' , :path => '../node_modules/clevertap-react-native'`
        );
        fs.writeFileSync(podfilePath, podfileContents);
      }

      // Add CTNotificationServiceExtension if it doesn't already exist
      if ((clevertapProps.ios?.notifications?.enableRichMedia || clevertapProps.ios?.notifications?.enablePushImpression) && !podfileContents.match(NSE_PODFILE_REGEX)) {
        fs.appendFile(podfilePath, NSE_PODFILE_SNIPPET, (err) => {
          if (err) {
            CleverTapLog.error("Error writing CTNotificationServiceExtension to Podfile");
          }
        })
      }

      // Add CTNotificationContentExtension if it doesn't already exist
      if (clevertapProps.ios?.notifications?.enablePushTemplate && !podfileContents.match(NCE_PODFILE_REGEX)) {
        fs.appendFile(podfilePath, NCE_PODFILE_SNIPPET, (err) => {
          if (err) {
            CleverTapLog.error("Error writing CTNotificationContentExtension to Podfile");
          }
        })
      }
      return config;
    },
  ]);
};