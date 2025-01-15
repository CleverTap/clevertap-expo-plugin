import {
    ConfigPlugin,
    withInfoPlist,
    withAppDelegate,
    withXcodeProject,
    withDangerousMod,
    withEntitlementsPlist
  } from "@expo/config-plugins";
  import * as fs from 'fs';
  import * as path from 'path';
  import {
    DEFAULT_BUNDLE_SHORT_VERSION,
    DEFAULT_BUNDLE_VERSION,
    IPHONEOS_DEPLOYMENT_TARGET,
    TARGETED_DEVICE_FAMILY,
    NSE_TARGET_NAME,
    NSE_SOURCE_FILE,
    NSE_EXT_FILES,
    NSE_PODFILE_SNIPPET,
    NSE_PODFILE_REGEX,
    TARGET_PODFILE_REGEX,
    NCE_TARGET_NAME,
    NCE_EXT_FILES,
    NCE_SOURCE_FILE,
    NCE_PODFILE_REGEX,
    NCE_PODFILE_SNIPPET
  } from "../support/IOSConstants";
  import { CleverTapPluginProps } from "../types/types";
  import { CleverTapLog } from "../support/CleverTapLog";
  import { FileManager } from "../support/FileManager";
  import  NSUpdaterManager from "../support/NSUpdaterManager";
  import {addCleverTapImportsAutoIntegrate, 
          addCleverTapAutoIntegrate,
          addCleverTapImportsTemplates,
          addCleverTapTemplates,
          addCleverTapNotificationCategory,
          addCleverTapURLDelegate } from "../support/UpdateAppDelegate";

 /**
 * Add "Background Modes -> Remote notifications"
 */
  const withRemoteNotificationsPermissions: ConfigPlugin<CleverTapPluginProps> = ( config ) => {
    const BACKGROUND_MODE_KEYS = ["remote-notification"];
    return withInfoPlist(config, (newConfig) => {
      if (!Array.isArray(newConfig.modResults.UIBackgroundModes)) {
        newConfig.modResults.UIBackgroundModes = [];
      }
      for (const key of BACKGROUND_MODE_KEYS) {
        if (!newConfig.modResults.UIBackgroundModes.includes(key)) {
          newConfig.modResults.UIBackgroundModes.push(key);
        }
      }
      return newConfig;
    });
  };

 /**
 * Update AppDelegate with required CleverTap's setup 
 */
  const withCleverTapAppDelegate: ConfigPlugin<CleverTapPluginProps> = (config,
    clevertapProps) => {
    return withAppDelegate(config, (config) => {
      let appDelegate = config.modResults.contents;
      // Adds imports at the top
      if (!appDelegate.includes('[CleverTap autoIntegrate]')) {
        config.modResults.contents =  addCleverTapImportsAutoIntegrate(appDelegate)
        appDelegate =  addCleverTapAutoIntegrate(appDelegate)
      }
      
      // Adds Custom template
      appDelegate = config.modResults.contents;
      if (!appDelegate.includes('registerCustomTemplates') && clevertapProps.templateIdentifier) {
        config.modResults.contents = addCleverTapImportsTemplates(appDelegate)
        appDelegate = config.modResults.contents;
        config.modResults.contents = addCleverTapTemplates(appDelegate, clevertapProps.templateIdentifier)
      }
     // Adds UNNotificationCategory code
      if (!appDelegate.includes('UNNotificationCategory') && clevertapProps.notificationCategory?.identifier && clevertapProps.notificationCategory?.actions.length) {
        appDelegate = config.modResults.contents;
        config.modResults.contents =  addCleverTapNotificationCategory(appDelegate, clevertapProps.notificationCategory?.identifier, clevertapProps.notificationCategory?.actions)
      }

     // Adds CleverTapURLDelegate code
      if (!appDelegate.includes('CleverTapURLDelegate.h') && clevertapProps.enableURLDelegate) {
        appDelegate = config.modResults.contents;
        config.modResults.contents = addCleverTapURLDelegate(appDelegate)
      }
      return config;
    });
  };

 /**
 * Add pod for CleverTap, CTNotificationServiceExtension and CTNotificationContentExtension
 */
  const withCleverTapPod: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
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
        if ((clevertapProps.enableRichMedia || clevertapProps.enablePushImpression) && !podfileContents.match(NSE_PODFILE_REGEX)) {
          fs.appendFile(podfilePath, NSE_PODFILE_SNIPPET, (err) => {
            if (err) {
              CleverTapLog.error("Error writing CTNotificationServiceExtension to Podfile");
            }
          })}

          // Add CTNotificationContentExtension if it doesn't already exist
        if (clevertapProps.enablePushTemplate && !podfileContents.match(NCE_PODFILE_REGEX)) {
          fs.appendFile(podfilePath, NCE_PODFILE_SNIPPET, (err) => {
            if (err) {
              CleverTapLog.error("Error writing CTNotificationContentExtension to Podfile");
            }
          })}
        return config;
      },
    ]);
  };

 /**
 * Add CleverTap credentials in Info.plist
 */
  const withCleverTapInfoPlist: ConfigPlugin<CleverTapPluginProps> = (
    config,
    clevertapProps
  ) => {
    return withInfoPlist(config, (config) => {
      config.modResults.CleverTapAccountID = clevertapProps.accountId;
      config.modResults.CleverTapToken = clevertapProps.accountToken;
  
      if (clevertapProps.accountRegion) {
        config.modResults.CleverTapRegion = clevertapProps.accountRegion;
      }
      return config;
    });
  };

 /**
 * Adds NotificationServiceExtension target in xcode project
 */
  const withCleverTapXcodeProjectNSE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
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
      const groups = xcodeProject.hash.project.objects["PBXGroup"];
      Object.keys(groups).forEach(function(key) {
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
        [],
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
          const buildSettingsObj = configurations[key].buildSettings;
          buildSettingsObj.DEVELOPMENT_TEAM = clevertapProps?.devTeam;
          buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = clevertapProps?.iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
          buildSettingsObj.TARGETED_DEVICE_FAMILY = clevertapProps?.deviceFamily ?? TARGETED_DEVICE_FAMILY;
          buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
          buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
          buildSettingsObj.SWIFT_VERSION = '5.0';
        }
      }
  
      // Add development teams to both your target and the original project      
      xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam, nseTarget);
      xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam);
      CleverTapLog.log('Added CTNotificationServiceExtension target');
      return newConfig;
    })
  };

 /**
 * Adds NotificationContentExtension target in xcode project
 */
  const withCleverTapXcodeProjectNCE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
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
      Object.keys(groups).forEach(function(key) {
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
          buildSettingsObj.DEVELOPMENT_TEAM = clevertapProps?.devTeam;
          buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = clevertapProps?.iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
          buildSettingsObj.TARGETED_DEVICE_FAMILY = clevertapProps?.deviceFamily ?? TARGETED_DEVICE_FAMILY;
          // buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
          buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
          buildSettingsObj.SWIFT_VERSION = '5.0';
        }
      }
  
      // Add development teams to both your target and the original project      
      xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam, nceTarget);
      xcodeProject.addTargetAttribute("DevelopmentTeam", clevertapProps?.devTeam);
      CleverTapLog.log('Added CTNotificationContentExtension target');
      return newConfig;
    })
  };

 /**
 * Copy NotificationServiceExtension with CleverTap code files into target folder
 */
  const withCleverTapNSE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
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
        const sourcePath = clevertapProps.iosNSEFilePath ?? `${sourceDir}${NSE_SOURCE_FILE}`
        const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;

        await FileManager.copyFile(`${sourcePath}`, targetFile);
        
        /* MODIFY COPIED EXTENSION FILES */
        const nseUpdater = new NSUpdaterManager(`${iosPath}/${NSE_TARGET_NAME}`,`${NSE_TARGET_NAME}-Info.plist`, `${NSE_TARGET_NAME}.entitlements`);
        await nseUpdater.updateNSEEntitlements(`group.${config.ios?.bundleIdentifier}.clevertap`)
        await nseUpdater.updateNEBundleVersion(config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
        await nseUpdater.updateNEBundleShortVersion(config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);
        CleverTapLog.log('Added NotificationServiceExtension files into target folder');
        //Adds push impression code
        if (clevertapProps.enablePushImpression) {
          updatePushImpressionNSE(iosPath, clevertapProps);
        }
        
        //Adds Rich media code
        if (clevertapProps.enableRichMedia) {
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
      console.log('Updated NotificationServiceExtension successfully.');
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
    const profile = clevertapProps.profileProps;
  
    // Validate profile properties
    if (!(profile?.name && profile.identity && profile.email)) {
      throw new Error(`Some or all properties are missing from profile: ${JSON.stringify(profile)}`);
    }
  
    // Add CleverTap integration if not already present
    if (!notificationServiceContent.includes('recordNotificationViewedEvent')) {
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
        `let profile: Dictionary<String, AnyObject> = [
         "Name": "${profile.name}" as AnyObject,
         "Identity": ${profile.identity} as AnyObject,
         "Email": "${profile.email}" as AnyObject]
        
         CleverTap.sharedInstance()?.profilePush(profile)
         CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
         super.didReceive(request, withContentHandler: contentHandler)`
      );
  
      // Write the updated content back to the file
      fs.writeFileSync(filePath, notificationServiceContent, 'utf-8');
      console.log('Updated NotificationServiceExtension successfully.');
    } else {
      console.log('recordNotificationViewedEvent already exists, not updating the code.');
    }
  }

 /**
 * Copy NotificationContentExtension with CleverTap code files into target folder
 */
  const withCleverTapNCE: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
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
        const sourcePath = clevertapProps.iosNCEFilePath ?? `${sourceDir}${NCE_SOURCE_FILE}`
        const targetFile = `${iosPath}/${NCE_TARGET_NAME}/${NCE_SOURCE_FILE}`;

        await FileManager.copyFile(`${sourcePath}`, targetFile);
        
        /* MODIFY COPIED EXTENSION FILES */
        const nseUpdater = new NSUpdaterManager(`${iosPath}/${NCE_TARGET_NAME}`,`${NCE_TARGET_NAME}-Info.plist`, );
        // await nseUpdater.updateNSEEntitlements(`group.${config.ios?.bundleIdentifier}.clevertap`)
        await nseUpdater.updateNEBundleVersion(config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
        await nseUpdater.updateNEBundleShortVersion(config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);

        CleverTapLog.log('Added NotificationContentExtension files into target folder');
        return config;
      },
    ]);
  };

/**
 * Update NSE's entitlement file with App group
 */
const withAppGroupPermissions: ConfigPlugin<CleverTapPluginProps> = (
  config
) => {
  const APP_GROUP_KEY = "com.apple.security.application-groups";
  return withEntitlementsPlist(config, config => {
    if (!Array.isArray(config.modResults[APP_GROUP_KEY])) {
      config.modResults[APP_GROUP_KEY] = [];
    }
    const appGroups = config.modResults[APP_GROUP_KEY];
    const entitlement = `group.${config?.ios?.bundleIdentifier || ""}`;
    if (!appGroups.includes(entitlement)) {
      appGroups.push(entitlement);
    }
    config.modResults[APP_GROUP_KEY] = appGroups;
    return config;
  });
};

export const withCleverTapIos: ConfigPlugin<CleverTapPluginProps> = (config, clevertapProps) => {
    config = withRemoteNotificationsPermissions(config, clevertapProps);
    config = withAppGroupPermissions(config, clevertapProps);

    if (clevertapProps.enablePushTemplate) {
      config = withCleverTapNCE(config, clevertapProps);
      config = withCleverTapXcodeProjectNCE(config, clevertapProps);
    } 
    if (clevertapProps.enableRichMedia || clevertapProps.enablePushImpression) {
      config = withCleverTapNSE(config, clevertapProps);
      config = withCleverTapXcodeProjectNSE(config, clevertapProps);
    } 
    config = withCleverTapPod(config, clevertapProps);
    config = withCleverTapInfoPlist(config, clevertapProps);
    config = withCleverTapAppDelegate(config, clevertapProps);

    return config;
};