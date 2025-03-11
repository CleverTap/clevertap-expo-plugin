import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';
import { CleverTapLog } from '../../../support/CleverTapLog';
import { CleverTapPluginProps } from '../../../types/types';

// Track previously copied sound files for cleanup
const CLEVERTAP_SOUND_FILE_MARKER = 'clevertap_copied_sounds.txt';


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
 * Copies custom notification sound files from assets to Android res/raw folder
 * and cleans up removed sound files
 */
export const withCustomNotificationSound: ConfigPlugin<CleverTapPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { android } = props;
      const projectRoot = config.modRequest.projectRoot;
      const androidRawPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'raw');
      const markerFilePath = path.join(androidRawPath, CLEVERTAP_SOUND_FILE_MARKER);
      
      // Create raw directory if it doesn't exist
      if (!fs.existsSync(androidRawPath)) {
        fs.mkdirSync(androidRawPath, { recursive: true });
      }
      
      // Get previously copied files
      let previousSoundFiles: string[] = [];
      if (fs.existsSync(markerFilePath)) {
        try {
          const fileContent = fs.readFileSync(markerFilePath, 'utf8');
          previousSoundFiles = JSON.parse(fileContent);
        } catch (error) {
          CleverTapLog.error(`Error reading previous sound files marker: ${error instanceof Error ? error.message : String(error)}`);
          previousSoundFiles = [];
        }
      }
      
      // Get current sound files from props
      let currentSoundFiles: string[] = [];
      if (android?.customNotificationSound) {
        if (Array.isArray(android.customNotificationSound)) {
          currentSoundFiles = android.customNotificationSound;
        } else {
          currentSoundFiles = [android.customNotificationSound];
        }
      }
      
      // Copy new or updated sound files
      for (const soundFileName of currentSoundFiles) {
        try {
          const soundSourcePath = path.join(projectRoot, 'assets', soundFileName);
          const soundDestPath = path.join(androidRawPath, soundFileName);
          
          // Check if source file exists
          if (!fs.existsSync(soundSourcePath)) {
            CleverTapLog.error(`Custom notification sound file ${soundFileName} not found in assets folder`);
            continue;
          }
          
          // Check if destination file exists and has the same content
          let shouldCopy = true;
          if (fs.existsSync(soundDestPath)) {
            const sourceStats = fs.statSync(soundSourcePath);
            const destStats = fs.statSync(soundDestPath);
            
            // Skip if file sizes match and modification time of dest is newer than source
            if (sourceStats.size === destStats.size && destStats.mtime >= sourceStats.mtime) {
              shouldCopy = false;
              CleverTapLog.log(`Sound file ${soundFileName} is up to date, skipping copy`);
            }
          }
          
          if (shouldCopy) {
            fs.copyFileSync(soundSourcePath, soundDestPath);
            CleverTapLog.log(`Successfully copied ${soundFileName} to android/app/src/main/res/raw folder`);
          }
        } catch (error) {
          CleverTapLog.error(`Error copying custom notification sound: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Remove sound files that are no longer in the configuration
      const filesToRemove = previousSoundFiles.filter(file => !currentSoundFiles.includes(file));
      CleverTapLog.log(`filesToRemove=${filesToRemove}`);
      for (const fileToRemove of filesToRemove) {
        try {
          const filePath = path.join(androidRawPath, fileToRemove);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            CleverTapLog.log(`Removed unused sound file: ${fileToRemove}`);
          }
        } catch (error) {
          CleverTapLog.error(`Error removing sound file ${fileToRemove}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Update or remove marker file based on current files
      try {
        if (currentSoundFiles.length > 0) {
          // Update marker file if we have sound files
          fs.writeFileSync(markerFilePath, JSON.stringify(currentSoundFiles), 'utf8');
        } else if (fs.existsSync(markerFilePath)) {
          // Remove marker file if there are no sound files
          fs.unlinkSync(markerFilePath);
          CleverTapLog.log(`Removed sound files marker as all sound files were removed`);
        }
      } catch (error) {
        CleverTapLog.error(`Error managing sound files marker: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      return config;
    },
  ]);
};