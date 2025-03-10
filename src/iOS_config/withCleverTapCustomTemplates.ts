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
      const templateIdentifiers = clevertapProps.ios?.templateIdentifiers;

      const sourcePath = path.resolve(projectRoot, templateIdentifiers?.source ?? "assets"); // e.g., "./assets"
      const iosPath = path.join(projectRoot, "ios");
      const destPath = path.join(iosPath, projectName ?? "", templateIdentifiers?.destination ?? ""); // iOS main bundle

      // Ensure the destination directory exists and copy files
      fs.ensureDirSync(destPath);

      // Read all JSON files from the directory
      const jsonFiles = fs.readdirSync(sourcePath).filter(file => file.endsWith(".json"));

      // Filter only the JSON files that match specificFiles
      const filteredFiles = jsonFiles.filter(file =>
        templateIdentifiers?.templates.includes(path.basename(file, ".json")) // Remove .json and check against the list
      );
      if (filteredFiles.length == 0) {
        CleverTapLog.error(`To enable using custom templates, add json files in the path provided: ${templateIdentifiers?.destination}`);
        return config;
      }
      filteredFiles.forEach(file => {
        const srcFile = path.join(sourcePath, file);
        const destFile = path.join(destPath, file);
        fs.copySync(srcFile, destFile, { overwrite: true });
      });
      CleverTapLog.log(`Successfully added template files: ${JSON.stringify(templateIdentifiers?.templates)} from: ${sourcePath} to iOS bundle: ${destPath}`);
      return config;
    },
  ]);
};