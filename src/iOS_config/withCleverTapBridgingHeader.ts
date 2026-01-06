import {
    ConfigPlugin,
    withDangerousMod
} from "@expo/config-plugins";
import * as path from 'path';
import * as fs from "fs-extra";
import { CleverTapPluginProps } from "../../types/types";
import { CleverTapLog } from "../../support/CleverTapLog";

const IMPORT_STATEMENT = '#import <React/RCTBridge.h>';
const SOURCE_URL_PATTERN = /override\s+func\s+sourceURL\s*\(\s*for\s+bridge:\s*RCTBridge\s*\)\s*->\s*URL\?/;

/**
 * Finds the bridging header file in the iOS directory
 */
function findBridgingHeader(iosPath: string, appName: string): string | null {
    const possibleNames = [
        `${appName}-Bridging-Header.h`,
        `${appName}BridgingHeader.h`,
        'Bridging-Header.h',
        'BridgingHeader.h'
    ];
    for (const name of possibleNames) {
        const fullPath = path.join(iosPath, name);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
        const appSubdirPath = path.join(iosPath, appName, name);
        if (fs.existsSync(appSubdirPath)) {
            return appSubdirPath;
        }
    }
    return null;
}

/**
 * Creates a bridging header if it doesn't exist
 */
function createBridgingHeader(bridgingHeaderPath: string): void {
    const initialContent = `//
//  Bridging Header
//
//  Created by Expo Config Plugin
//

${IMPORT_STATEMENT}
`;
    fs.ensureFileSync(bridgingHeaderPath);
    fs.writeFileSync(bridgingHeaderPath, initialContent, 'utf-8');
    CleverTapLog.log(`Created new bridging header at ${bridgingHeaderPath}`);
}

/**
 * Adds import statement after the last existing import in the bridging header
 */
function addImportToBridgingHeader(content: string): string {
    const lines = content.split('\n');
    // Find the index after the last import statement
    let insertIndex = lines.findLastIndex(line => line.trim().startsWith('#import'));
    insertIndex = insertIndex === -1 ? 0 : insertIndex + 1;
    // Insert the import statement
    lines.splice(insertIndex, 0, IMPORT_STATEMENT);
    return lines.join('\n');
}

/**
 * Adds RCTBridge import to bridging header if sourceURL function exists in AppDelegate
 */
export const withCleverTapBridgingHeader: ConfigPlugin<CleverTapPluginProps> = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const appName = config.name?.replace(/[^a-zA-Z0-9]/g, '') || 'App';
            const iosPath = path.join(config.modRequest.projectRoot, "ios");
            const appDelegateSwiftPath = path.join(iosPath, appName, 'AppDelegate.swift');
            // Early exit if AppDelegate doesn't exist
            if (!fs.existsSync(appDelegateSwiftPath)) {
                CleverTapLog.log('AppDelegate.swift not found, skipping bridging header update');
                return config;
            }
            // Check if sourceURL function exists in AppDelegate
            const appDelegateContent = fs.readFileSync(appDelegateSwiftPath, 'utf-8');
            if (!SOURCE_URL_PATTERN.test(appDelegateContent)) {
                CleverTapLog.log('sourceURL function does not exist in AppDelegate, skipping bridging header');
                return config;
            }
            CleverTapLog.log('Found sourceURL(for bridge: RCTBridge) function in AppDelegate.swift');
            // Try to find existing bridging header
            let bridgingHeaderPath = findBridgingHeader(iosPath, appName);
            if (!bridgingHeaderPath) {
                // Create bridging header if it doesn't exist
                bridgingHeaderPath = path.join(iosPath, appName, `${appName}-Bridging-Header.h`);
                createBridgingHeader(bridgingHeaderPath);
            } else {
                CleverTapLog.log(`Found bridging header at ${bridgingHeaderPath}`);
            }
            // Read and check bridging header
            const bridgingHeaderContent = fs.readFileSync(bridgingHeaderPath, 'utf-8');
            if (bridgingHeaderContent.includes(IMPORT_STATEMENT)) {
                CleverTapLog.log('RCTBridge import already exists in bridging header');
                return config;
            }
            // Add import after the last existing import or at the beginning
            const updatedContent = addImportToBridgingHeader(bridgingHeaderContent);
            fs.writeFileSync(bridgingHeaderPath, updatedContent, 'utf-8');
            CleverTapLog.log(`Successfully added ${IMPORT_STATEMENT} to bridging header`);
            return config;
        },
    ]);
};