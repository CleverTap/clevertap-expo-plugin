import {
    ConfigPlugin,
    withXcodeProject,
    withDangerousMod,
    withEntitlementsPlist
} from "@expo/config-plugins";
import * as path from 'path';
import * as fs from "fs-extra";
import { FileManager } from "./FileManager";
import { CleverTapPluginProps } from "../../types/types";
import NSUpdaterManager from "./NSUpdaterManager";
import { CleverTapLog } from "../../support/CleverTapLog";
import {
    NCE_TARGET_NAME,
    NCE_EXT_FILES,
    NCE_SOURCE_FILE,
    DEFAULT_BUNDLE_VERSION,
    DEFAULT_BUNDLE_SHORT_VERSION
} from "./IOSConstants";

/**
* Copy NotificationContentExtension with CleverTap code files into target folder
*/
export const withCleverTapNCE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    // support for monorepos where node_modules can be above the project directory.
    const pluginDir = require.resolve("clevertap-expo-plugin/package.json")
    const sourceDir = path.join(pluginDir, "../ios/ExpoAdapterCleverTap/NotificationContentExtension/")

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

        const pluginDir = require.resolve("clevertap-expo-plugin/package.json")
        // Create new PBXGroup for the extension
        const extGroup = xcodeProject.addPbxGroup([...NCE_EXT_FILES, NCE_SOURCE_FILE], NCE_TARGET_NAME, NCE_TARGET_NAME);

        const projObjects = xcodeProject.hash.project.objects
        const groups = projObjects["PBXGroup"];
        const xcconfigs = projObjects['XCBuildConfiguration'];

        // Add the new PBXGroup to the top level group. This makes the
        // files / folder appear in the file explorer in Xcode.
        Object.keys(groups).forEach(function (key) {
            if (typeof groups[key] === "object" && groups[key].name === undefined && groups[key].path === undefined) {
                xcodeProject.addToPbxGroup(extGroup.uuid, key);
            }
        });

        // WORK AROUND for codeProject.addTarget
        // Xcode projects don't contain these if there is only one target
        projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
        projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};

        // Retrieve Swift version and code signing settings from main target to apply to dependency targets.
      let swiftVersion;
      let codeSignStyle;
      let codeSignIdentity;
      let otherCodeSigningFlags;
      let developmentTeam;
      let provisioningProfile;
      for (const configUUID of Object.keys(xcconfigs)) {
        const buildSettings = xcconfigs[configUUID].buildSettings;
        if (!swiftVersion && buildSettings && buildSettings.SWIFT_VERSION) {
          swiftVersion = buildSettings.SWIFT_VERSION;
          codeSignStyle = buildSettings.CODE_SIGN_STYLE;
          codeSignIdentity = buildSettings.CODE_SIGN_IDENTITY;
          otherCodeSigningFlags = buildSettings.OTHER_CODE_SIGN_FLAGS;
          developmentTeam = buildSettings.DEVELOPMENT_TEAM;
          provisioningProfile = buildSettings.PROVISIONING_PROFILE_SPECIFIER;
          break;
        }
      }

        // Add the NSE target
        // This adds PBXTargetDependency and PBXContainerItemProxy for you
        const nceTarget = xcodeProject.addTarget(NCE_TARGET_NAME, "app_extension", NCE_TARGET_NAME, `${config.ios?.bundleIdentifier}.${NCE_TARGET_NAME}`);
        const groupKey = xcodeProject.findPBXGroupKey({ name: NCE_TARGET_NAME }) || xcodeProject.pbxCreateGroup(NCE_TARGET_NAME, NCE_TARGET_NAME);
        if (!groupKey) {
            console.warn(`Group for ${NCE_TARGET_NAME} was not found, creating a new one.`);
        }
        const sourceDir = path.join(pluginDir, "../build/support/contentExtensionFiles/")
        const storyboardPath = path.join(sourceDir, 'MainInterface.storyboard');

        // Add build phases to the new target
        xcodeProject.addBuildPhase(
            ["NotificationViewController.swift"],
            "PBXSourcesBuildPhase",
            "Sources",
            nceTarget.uuid
        );
        xcodeProject.addBuildPhase(["MainInterface.storyboard"], "PBXResourcesBuildPhase", "Resources", nceTarget.uuid);

        xcodeProject.addBuildPhase(
            [
                'UserNotifications.framework',
                'UserNotificationsUI.framework'
            ],
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
                buildSettingsObj.CTEXPO_PUSH_APP_GROUP = clevertapProps.ios?.notifications?.iosPushAppGroup;
                buildSettingsObj.SWIFT_VERSION = swiftVersion;
                if (codeSignStyle) { buildSettingsObj.CODE_SIGN_STYLE = codeSignStyle; }
                if (codeSignIdentity) { buildSettingsObj.CODE_SIGN_IDENTITY = codeSignIdentity; }
                if (otherCodeSigningFlags) { buildSettingsObj.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags; }
                if (developmentTeam) { buildSettingsObj.DEVELOPMENT_TEAM = developmentTeam; }
                if (provisioningProfile) { buildSettingsObj.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile; }
                buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NCE_TARGET_NAME}/${NCE_TARGET_NAME}.entitlements`;
            }
        }
        
        CleverTapLog.log('Successfully added NotificationContentExtension target');
        return newConfig;
    })
};

/**
 * Update NSE's entitlement file with App group
 */
export const withAppGroupPermissionsNCE: ConfigPlugin<CleverTapPluginProps> = (
    config, clevertapProps
) => {
    const APP_GROUP_KEY = "com.apple.security.application-groups";
    return withEntitlementsPlist(config, config => {
        if (config.modRequest.projectName === "${NCE_TARGET_NAME}" && clevertapProps.ios?.notifications?.iosPushAppGroup != null) {
            const APP_GROUP_KEY = "com.apple.security.application-groups";
            const existingAppGroups = config.modResults[APP_GROUP_KEY];
            if (Array.isArray(existingAppGroups) && !existingAppGroups.includes(clevertapProps.ios?.notifications?.iosPushAppGroup)) {
                config.modResults[APP_GROUP_KEY] = existingAppGroups.concat([clevertapProps.ios?.notifications?.iosPushAppGroup]);
              } else {
                config.modResults[APP_GROUP_KEY] = [clevertapProps.ios?.notifications?.iosPushAppGroup];
              }
        }
        return config;
    });
};