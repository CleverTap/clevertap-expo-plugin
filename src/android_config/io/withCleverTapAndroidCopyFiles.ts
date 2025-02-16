import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import { CleverTapLog } from '../../../support/CleverTapLog';
import { CleverTapPluginProps } from '../../../types/types';

/**
 * Copies agconnect-services.json from assets to Android/app folder if HMS Push is enabled
 */
export const withHuaweiConfig: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { android } = props;
      
      if (!android?.features?.enableHmsPush) {
        CleverTapLog.log("HMS Push is not enabled. Skipping agconnect-services.json setup.");
        return config;
      }

      try {
        // Get source and destination paths
        const projectRoot = config.modRequest.projectRoot;
        const agconnectSourcePath = path.join(projectRoot, 'assets', 'agconnect-services.json');
        const androidAppPath = path.join(projectRoot, 'android', 'app');
        const agconnectDestPath = path.join(androidAppPath, 'agconnect-services.json');

        // Check if source file exists
        if (!fs.existsSync(agconnectSourcePath)) {
          throw new Error('agconnect-services.json not found in assets folder');
        }

        // Create android/app directory if it doesn't exist
        if (!fs.existsSync(androidAppPath)) {
          fs.mkdirSync(androidAppPath, { recursive: true });
        }

        // Copy the file
        fs.copyFileSync(agconnectSourcePath, agconnectDestPath);
        CleverTapLog.log('Successfully copied agconnect-services.json to android/app folder');

      } catch (error) {
        if (error instanceof Error){
            CleverTapLog.error(`Error copying agconnect-services.json: ${error.message}`);
        }
      }

      return config;
    },
  ]);
};

/**
 * Copies custom notification sound file from assets to Android res/raw folder
 */
export const withCustomNotificationSound: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { android } = props;
      
      if (!android?.customNotificationSound) {
        CleverTapLog.log("No custom notification sound specified. Skipping sound file setup.");
        return config;
      }

      try {
        // Get source and destination paths
        const projectRoot = config.modRequest.projectRoot;
        const soundFileName = android.customNotificationSound;
        const soundSourcePath = path.join(projectRoot, 'assets', soundFileName);
        const androidRawPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'raw');
        const soundDestPath = path.join(androidRawPath, soundFileName);

        // Check if source file exists
        if (!fs.existsSync(soundSourcePath)) {
          throw new Error(`Custom notification sound file ${soundFileName} not found in assets folder`);
        }

        // Create android/app/src/main/res/raw directory if it doesn't exist
        if (!fs.existsSync(androidRawPath)) {
          fs.mkdirSync(androidRawPath, { recursive: true });
        }

        // Copy the file
        fs.copyFileSync(soundSourcePath, soundDestPath);
        CleverTapLog.log(`Successfully copied ${soundFileName} to android/app/src/main/res/raw folder`);
        
      } catch (error) {
        if (error instanceof Error){
            CleverTapLog.error(`Error copying custom notification sound: ${error.message}`);
        }
        
      }

      return config;
    },
  ]);
};