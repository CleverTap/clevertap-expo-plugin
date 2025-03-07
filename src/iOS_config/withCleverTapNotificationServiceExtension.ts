import {
    ConfigPlugin,
    withXcodeProject,
    withDangerousMod,
    withEntitlementsPlist
} from "@expo/config-plugins";
import * as path from 'path';
import * as fs from "fs-extra";
import { FileManager } from "../../support/FileManager";
import { CleverTapPluginProps } from "../../types/types";
import NSUpdaterManager from "../../support/NSUpdaterManager";
import { CleverTapLog } from "../../support/CleverTapLog";
import {
    NSE_TARGET_NAME,
    NSE_EXT_FILES,
    NSE_SOURCE_FILE,
    DEFAULT_BUNDLE_VERSION,
    DEFAULT_BUNDLE_SHORT_VERSION,
    DEPLOYMENT_TARGET,
    TARGETED_DEVICE_FAMILY
} from "../../support/IOSConstants";

/**
* Copy NotificationServiceExtension with CleverTap code files into target folder
*/
export const withCleverTapNSE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    // support for monorepos where node_modules can be above the project directory.
    const pluginDir = require.resolve("clevertap-expo-plugin/package.json")
    const sourceDir = path.join(pluginDir, "../build/support/serviceExtensionFiles/")

    return withDangerousMod(config, [
        'ios',
        async config => {
            const iosPath = path.join(config.modRequest.projectRoot, "ios")

            /* COPY OVER EXTENSION FILES */
            fs.mkdirSync(`${iosPath}/${NSE_TARGET_NAME}`, { recursive: true });

            for (let i = 0; i < NSE_EXT_FILES.length; i++) {
                const extFile = NSE_EXT_FILES[i];
                const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${extFile}`;
                await FileManager.copyFile(`${sourceDir}${extFile}`, targetFile);
            }

            // Copy NSE source file either from configuration-provided location, falling back to the default one.
            const sourcePath = clevertapProps.ios?.notifications?.iosNSEFilePath ?? `${sourceDir}${NSE_SOURCE_FILE}`
            const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;

            await FileManager.copyFile(`${sourcePath}`, targetFile);

            /* MODIFY COPIED EXTENSION FILES */
            const nseUpdater = new NSUpdaterManager(`${iosPath}/${NSE_TARGET_NAME}`, `${NSE_TARGET_NAME}-Info.plist`, `${NSE_TARGET_NAME}.entitlements`);
            await nseUpdater.updateNSEEntitlements(`group.${config.ios?.bundleIdentifier}.clevertap`)
            await nseUpdater.updateNEBundleVersion(config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
            await nseUpdater.updateNEBundleShortVersion(config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);
            CleverTapLog.log('Added NotificationServiceExtension files into target folder');
            //Adds push impression code
            if (clevertapProps.ios?.notifications?.enablePushImpression) {
                updatePushImpressionNSE(iosPath, clevertapProps);
            }

            //Adds Rich media code
            if (clevertapProps.ios?.notifications?.enableRichMedia) {
                updateRichMediaNSE(iosPath, clevertapProps);
            }
            return config;
        },
    ]);
};

/**
 * Update NotificationServiceExtension with CleverTap code to enable rich media
 */
function updateRichMediaNSE(
    iosPath: string,
    clevertapProps: CleverTapPluginProps
): void {
    const filePath = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;
    // Check if the service file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`Could not locate NotificationServiceExtension file at ${filePath}`);
    }

    let notificationServiceContent = fs.readFileSync(filePath, 'utf-8');

    // Add CleverTap integration if not already present
    if (!notificationServiceContent.includes('CTNotificationService')) {
        //Update import
        notificationServiceContent = notificationServiceContent.replace(
            `import UserNotifications`,
            `import CTNotificationService`
        )

        //Update Base class
        notificationServiceContent = notificationServiceContent.replace(
            `UNNotificationServiceExtension`,
            `CTNotificationServiceExtension`);

        fs.writeFileSync(filePath, notificationServiceContent);
        console.log('Updated NotificationServiceExtension for rich media support successfully.');
    } else {
        console.log("CTNotificationService already exists, not updating the code");
    }
}

/**
 * Update NotificationServiceExtension with CleverTap code to enable push impressions
 */
function updatePushImpressionNSE(
    iosPath: string,
    clevertapProps: CleverTapPluginProps
): void {
    const filePath = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;
    // Check if the service file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`Could not locate NotificationServiceExtension file at ${filePath}`);
    }

    let notificationServiceContent = fs.readFileSync(filePath, 'utf-8');
    const profile = clevertapProps.ios?.profileProps;

    // Validate profile properties
    if (!(profile?.name && profile.identity && profile.email)) {
        throw new Error(`Some or all properties are missing from profile: ${JSON.stringify(profile)}`);
    }

    // Add CleverTap integration if not already present
    if (!notificationServiceContent.includes('getUserDefaults(request)')) {
        console.log('Adding CleverTap integration to NotificationServiceExtension.');

        // Update import
        notificationServiceContent = notificationServiceContent.replace(
            `import UserNotifications`,
            `import UserNotifications
           import CleverTapSDK`
        );

        // Add CleverTap event tracking code
        notificationServiceContent = notificationServiceContent.replace(
            `super.didReceive(request, withContentHandler: contentHandler)`,
            `getUserDefaults(request)
            super.didReceive(request, withContentHandler: contentHandler)`
        );

        // Write the updated content back to the file
        fs.writeFileSync(filePath, notificationServiceContent, 'utf-8');
        console.log('Updated NotificationServiceExtension for push impression support successfully.');
    } else {
        console.log('recordNotificationViewedEvent already exists, not updating the code.');
    }
}

/**
* Adds NotificationServiceExtension target in xcode project
*/
export const withCleverTapXcodeProjectNSE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    return withXcodeProject(config, newConfig => {
        const xcodeProject = newConfig.modResults

        if (!!xcodeProject.pbxTargetByName(NSE_TARGET_NAME)) {
            CleverTapLog.log(`${NSE_TARGET_NAME} already exists in project. Skipping...`);
            return newConfig;
        }

        // Create new PBXGroup for the extension
        const extGroup = xcodeProject.addPbxGroup([...NSE_EXT_FILES, NSE_SOURCE_FILE], NSE_TARGET_NAME, NSE_TARGET_NAME);

        // Add the new PBXGroup to the top level group. This makes the
        // files / folder appear in the file explorer in Xcode.
        const projObjects = xcodeProject.hash.project.objects
        const groups = projObjects["PBXGroup"];
        const xcconfigs = projObjects['XCBuildConfiguration'];
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
        const nseTarget = xcodeProject.addTarget(NSE_TARGET_NAME, "app_extension", NSE_TARGET_NAME, `${config.ios?.bundleIdentifier}.${NSE_TARGET_NAME}`);

        // Add build phases to the new target
        xcodeProject.addBuildPhase(
            ["NotificationService.swift"],
            "PBXSourcesBuildPhase",
            "Sources",
            nseTarget.uuid
        );
        xcodeProject.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", nseTarget.uuid);

        xcodeProject.addBuildPhase(
            ['UserNotifications.framework'],
            "PBXFrameworksBuildPhase",
            "Frameworks",
            nseTarget.uuid
        );

        // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
        // However, can be more
        const configurations = xcodeProject.pbxXCBuildConfigurationSection();
        for (const key in configurations) {
            if (
                typeof configurations[key].buildSettings !== "undefined" &&
                configurations[key].buildSettings.PRODUCT_NAME == `"${NSE_TARGET_NAME}"`
            ) {
                CleverTapLog.log('Inside CTNotificationServiceExtension target');

                const buildSettingsObj = configurations[key].buildSettings;
                buildSettingsObj.CT_PUSH_APP_GROUP = clevertapProps.ios?.notifications?.iosPushAppGroup;
                buildSettingsObj.SWIFT_VERSION = swiftVersion;
                if (codeSignStyle) { buildSettingsObj.CODE_SIGN_STYLE = codeSignStyle; }
                if (codeSignIdentity) { buildSettingsObj.CODE_SIGN_IDENTITY = codeSignIdentity; }
                if (otherCodeSigningFlags) { buildSettingsObj.OTHER_CODE_SIGN_FLAGS = otherCodeSigningFlags; }
                if (developmentTeam) { buildSettingsObj.DEVELOPMENT_TEAM = developmentTeam; }
                if (provisioningProfile) { buildSettingsObj.PROVISIONING_PROFILE_SPECIFIER = provisioningProfile; }
                buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
            }
        }

        // Add development teams to both your target and the original project      
        // xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam, nseTarget);
        // xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam);
        CleverTapLog.log('Added CTNotificationServiceExtension target');
        return newConfig;
    })
};

/**
 * Update NSE's entitlement file with App group
 */
export const withAppGroupPermissionsNSE: ConfigPlugin<CleverTapPluginProps> = (
    config, clevertapProps
) => {
    return withEntitlementsPlist(config, config => {
      const APP_GROUP_KEY = "com.apple.security.application-groups";

      const existingAppGroups = config.modResults[APP_GROUP_KEY];
      CleverTapLog.log(`enetered withEntitlementsPlist withAppGroupPermissionsNSE entered ${existingAppGroups}`);

      if (clevertapProps.ios?.notifications?.iosPushAppGroup != null) {
        CleverTapLog.log(`enetered withAppGroupPermissionsNSE entered ${clevertapProps.ios?.notifications?.iosPushAppGroup}`);

        if (Array.isArray(existingAppGroups) && !existingAppGroups.includes(clevertapProps.ios?.notifications?.iosPushAppGroup)) {
            CleverTapLog.log(`enetered withAppGroupPermissionsNSE ${clevertapProps.ios?.notifications?.iosPushAppGroup}`);
            config.modResults[APP_GROUP_KEY] = existingAppGroups.concat([clevertapProps.ios?.notifications?.iosPushAppGroup]);
          } else {
            CleverTapLog.log(`enetered withAppGroupPermissionsNSE ${clevertapProps.ios?.notifications?.iosPushAppGroup}`);
            config.modResults[APP_GROUP_KEY] = [clevertapProps.ios?.notifications?.iosPushAppGroup];
          }

      }
        return config;
    });
};