import {
    ConfigPlugin,
    withDangerousMod
  } from "@expo/config-plugins";
import { CleverTapPluginProps } from "../../types/types";
import { CleverTapLog } from "../../support/CleverTapLog";
import * as fs from "fs-extra";
import * as path from 'path';
/**
 * Copy Custom Template files into iOS main bundle
 */
export const addCustomTemplateFilesToBundle: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
  // support for monorepos where node_modules can be above the project directory.    
  return withDangerousMod(config, [
    'ios',
    async config => {
      // Get the root directory of the Expo project
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName;

      const sourcePath = path.resolve(projectRoot, clevertapProps.ios?.templateIdentifiers?.source ?? "assets"); // e.g., "./assets"
      const iosPath = path.join(projectRoot, "ios");
      const destPath = path.join(iosPath, projectName ?? "", clevertapProps.ios?.templateIdentifiers?.destination ?? ""); // iOS main bundle

      // Ensure the destination directory exists and copy files
      fs.ensureDirSync(destPath);

      // Read all JSON files from the directory
      const jsonFiles = fs.readdirSync(sourcePath).filter(file => file.endsWith(".json"));

      // Filter only the JSON files that match specificFiles1
      const filteredFiles = jsonFiles.filter(file =>
        clevertapProps.ios?.templateIdentifiers?.templates.includes(path.basename(file, ".json")) // Remove .json and check against the list
      );
      if (filteredFiles.length == 0) {
        CleverTapLog.error("To enable using custom templates, add json files");
        return config;
      }
      CleverTapLog.log(`Adding template files from: ${sourcePath} to iOS bundle: ${destPath}`);
      filteredFiles.forEach(file => {
        CleverTapLog.log(file);
        const srcFile = path.join(sourcePath, file);
        const destFile = path.join(destPath, file);
        fs.copySync(srcFile, destFile, { overwrite: true });
      });
      return config;
    },
  ]);
};