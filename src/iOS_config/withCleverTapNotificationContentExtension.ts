import {
    ConfigPlugin,
    withXcodeProject,
    withDangerousMod
} from "@expo/config-plugins";
import * as path from 'path';
import * as fs from "fs-extra";
import { FileManager } from "../../support/FileManager";
import { CleverTapPluginProps } from "../../types/types";
import NSUpdaterManager from "../../support/NSUpdaterManager";
import { CleverTapLog } from "../../support/CleverTapLog";
import {
    NCE_TARGET_NAME,
    NCE_EXT_FILES,
    NCE_SOURCE_FILE,
    DEFAULT_BUNDLE_VERSION,
    DEFAULT_BUNDLE_SHORT_VERSION,
    DEPLOYMENT_TARGET,
    TARGETED_DEVICE_FAMILY
} from "../../support/IOSConstants";

/**
* Copy NotificationContentExtension with CleverTap code files into target folder
*/
export const withCleverTapNCE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    // support for monorepos where node_modules can be above the project directory.
    const pluginDir = require.resolve("clevertap-expo-plugin/package.json")
    const sourceDir = path.join(pluginDir, "../build/support/contentExtensionFiles/")

    return withDangerousMod(config, [
        'ios',
        async config => {
            const iosPath = path.join(config.modRequest.projectRoot, "ios")

            /* COPY OVER EXTENSION FILES */
            fs.mkdirSync(`${iosPath}/${NCE_TARGET_NAME}`, { recursive: true });

            for (let i = 0; i < NCE_EXT_FILES.length; i++) {
                const extFile = NCE_EXT_FILES[i];
                const targetFile = `${iosPath}/${NCE_TARGET_NAME}/${extFile}`;
                await FileManager.copyFile(`${sourceDir}${extFile}`, targetFile);
            }

            // Copy NSE source file either from configuration-provided location, falling back to the default one.
            const sourcePath = clevertapProps.ios?.notifications?.iosNCEFilePath ?? `${sourceDir}${NCE_SOURCE_FILE}`
            const targetFile = `${iosPath}/${NCE_TARGET_NAME}/${NCE_SOURCE_FILE}`;

            await FileManager.copyFile(`${sourcePath}`, targetFile);

            /* MODIFY COPIED EXTENSION FILES */
            const nseUpdater = new NSUpdaterManager(`${iosPath}/${NCE_TARGET_NAME}`, `${NCE_TARGET_NAME}-Info.plist`,);
            // await nseUpdater.updateNSEEntitlements(`group.${config.ios?.bundleIdentifier}.clevertap`)
            await nseUpdater.updateNEBundleVersion(config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
            await nseUpdater.updateNEBundleShortVersion(config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);

            CleverTapLog.log('Added NotificationContentExtension files into target folder');
            return config;
        },
    ]);
};

/**
* Adds NotificationContentExtension target in xcode project
*/
export const withCleverTapXcodeProjectNCE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    return withXcodeProject(config, newConfig => {
        const xcodeProject = newConfig.modResults

        if (!!xcodeProject.pbxTargetByName(NCE_TARGET_NAME)) {
            CleverTapLog.log(`${NCE_TARGET_NAME} already exists in project. Skipping...`);
            return newConfig;
        }

        // Create new PBXGroup for the extension
        const extGroup = xcodeProject.addPbxGroup([...NCE_EXT_FILES, NCE_SOURCE_FILE], NCE_TARGET_NAME, NCE_TARGET_NAME);

        // Add the new PBXGroup to the top level group. This makes the
        // files / folder appear in the file explorer in Xcode.
        const groups = xcodeProject.hash.project.objects["PBXGroup"];
        Object.keys(groups).forEach(function (key) {
            if (typeof groups[key] === "object" && groups[key].name === undefined && groups[key].path === undefined) {
                xcodeProject.addToPbxGroup(extGroup.uuid, key);
            }
        });

        // WORK AROUND for codeProject.addTarget
        // Xcode projects don't contain these if there is only one target
        const projObjects = xcodeProject.hash.project.objects;
        projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
        projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};

        // Add the NSE target
        // This adds PBXTargetDependency and PBXContainerItemProxy for you
        const nceTarget = xcodeProject.addTarget(NCE_TARGET_NAME, "app_extension", NCE_TARGET_NAME, `${config.ios?.bundleIdentifier}.${NCE_TARGET_NAME}`);
        const groupKey = xcodeProject.findPBXGroupKey({ name: NCE_TARGET_NAME }) || xcodeProject.pbxCreateGroup(NCE_TARGET_NAME, NCE_TARGET_NAME);
        if (!groupKey) {
            console.warn(`Group for ${NCE_TARGET_NAME} was not found, creating a new one.`);
        }
        const storyboardPath = `NotificationContent/MainInterface.storyboard`; // Relative path to the storyboard
        if (!xcodeProject.hasFile(storyboardPath)) {
            xcodeProject.addFile(storyboardPath, groupKey);
        }

        // Add build phases to the new target
        xcodeProject.addBuildPhase(
            ["NotificationViewController.swift"],
            "PBXSourcesBuildPhase",
            "Sources",
            nceTarget.uuid
        );
        xcodeProject.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", nceTarget.uuid);

        xcodeProject.addBuildPhase(
            [],
            "PBXFrameworksBuildPhase",
            "Frameworks",
            nceTarget.uuid
        );

        // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
        // However, can be more
        const configurations = xcodeProject.pbxXCBuildConfigurationSection();
        for (const key in configurations) {
            if (
                typeof configurations[key].buildSettings !== "undefined" &&
                configurations[key].buildSettings.PRODUCT_NAME == `"${NCE_TARGET_NAME}"`
            ) {
                const buildSettingsObj = configurations[key].buildSettings;
                buildSettingsObj.DEVELOPMENT_TEAM = config?.ios?.appleTeamId;
                buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = clevertapProps?.ios?.deploymentTarget ?? DEPLOYMENT_TARGET;
                buildSettingsObj.TARGETED_DEVICE_FAMILY = clevertapProps?.ios?.deviceFamily ?? TARGETED_DEVICE_FAMILY;
                // buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
                buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
                buildSettingsObj.SWIFT_VERSION = '5.0';
            }
        }

        // Add development teams to both your target and the original project      
        // xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam, nceTarget);
        // xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam);
        CleverTapLog.log('Added CTNotificationContentExtension target');
        return newConfig;
    })
};