import { ConfigPlugin, withSettingsGradle, withProjectBuildGradle } from '@expo/config-plugins';
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

import { CleverTapLog } from '../../../support/CleverTapLog';
import { CleverTapPluginProps } from '../../../types/types';

const GOOGLE_SERVICES_CLASSPATH = "com.google.gms:google-services:4.4.0";
const HMS_CLASSPATH = "com.huawei.agconnect:agcp:1.9.1.300";
const AGP_CLASSPATH = "com.android.tools.build:gradle:8.2.2"

interface ClasspathInfo {
    exists: boolean;
    currentVersion?: string;
    lineToReplace?: string;
}

export const withCleverTapRootGradlePlugin: ConfigPlugin<CleverTapPluginProps> = (config, {
    android: {
        features: {
            enablePush = false,
            enablePushTemplates = false,
            enableInApp = false,
            enableInbox = false,
            enableMediaForInAppsInbox = false,
            enableInstallReferrer = false,
            enableHmsPush = false,
            enableGoogleAdId = false
        } = {} // Default empty object for features
    } = {},
    ...props
}) => {

    const combinedProps: CleverTapPluginProps = {
        ...props,
        android: {
            features: {
                enablePush,
                enablePushTemplates,
                enableInApp,
                enableInbox,
                enableMediaForInAppsInbox,
                enableInstallReferrer,
                enableHmsPush,
                enableGoogleAdId
            }
        }
    };

    config = withCleverTapSettingsGradle(config, combinedProps);
    config = withCleverTapRootGradle(config, combinedProps);
    return config;
};

const withCleverTapSettingsGradle: ConfigPlugin<CleverTapPluginProps> = (
    config,
    { android: { features: { enableHmsPush = false } = {} } = {} }
) => {
    const pattern = /repositories\s*{/;
    return withSettingsGradle(config, config => {
        if (enableHmsPush && pattern.test(config.modResults.contents)) {
            config.modResults.contents = addHmsRepositoryToBlock(
                config.modResults.contents,
                pattern
            );
        }
        return config;
    });
};

const withCleverTapRootGradle: ConfigPlugin<CleverTapPluginProps> = (
    config, props
) => {
    return withProjectBuildGradle(config, config => {
        let contents = config.modResults.contents;
        const enableHmsPush = props.android.features.enableHmsPush;
        const enablePush = props.android.features.enablePush

        if (enableHmsPush) {
            contents = addHmsRepositoryToAllAvailableRepoBlocks(contents);
        }

        // Handle Google Services classpath
        if (enablePush) {
            const googleServicesInfo = getClasspathInfo(contents, GOOGLE_SERVICES_CLASSPATH);
            if (googleServicesInfo.exists && googleServicesInfo.currentVersion) {
                if (googleServicesInfo.currentVersion !== GOOGLE_SERVICES_CLASSPATH.split(':')[2]) {
                    const newLine = `classpath '${GOOGLE_SERVICES_CLASSPATH}'`;
                    contents = updateClasspathVersion(contents, googleServicesInfo.lineToReplace!, newLine);
                }
            }
        }

        // Handle HMS classpath if enabled
        if (enableHmsPush) {
            const hmsInfo = getClasspathInfo(contents, HMS_CLASSPATH);
            if (hmsInfo.exists && hmsInfo.currentVersion) {
                if (hmsInfo.currentVersion !== HMS_CLASSPATH.split(':')[2]) {
                    const newLine = `classpath '${HMS_CLASSPATH}'`;
                    contents = updateClasspathVersion(contents, hmsInfo.lineToReplace!, newLine);
                }
            }
            const agpInfo = getClasspathInfo(contents, AGP_CLASSPATH);
            if (agpInfo.exists && agpInfo.currentVersion) {
                if (agpInfo.currentVersion !== AGP_CLASSPATH.split(':')[2]) {
                    const newLine = `classpath '${AGP_CLASSPATH}'`;
                    contents = updateClasspathVersion(contents, agpInfo.lineToReplace!, newLine);
                }
            }
        }

        // Add new classpaths if they don't exist
        const neededClasspaths: string[] = [];
        if (enablePush) {
            const googleServicesInfo = getClasspathInfo(contents, GOOGLE_SERVICES_CLASSPATH);
            if (!googleServicesInfo.exists) {
                neededClasspaths.push(`classpath '${GOOGLE_SERVICES_CLASSPATH}'`);
            }
        }
        if (enableHmsPush) {
            const hmsInfo = getClasspathInfo(contents, HMS_CLASSPATH);
            const agpInfo = getClasspathInfo(contents, AGP_CLASSPATH);
            if (!hmsInfo.exists) {
                neededClasspaths.push(`classpath '${HMS_CLASSPATH}'`);
            }
            if (!agpInfo.exists) {
                neededClasspaths.push(`classpath '${AGP_CLASSPATH}'`);
            }
        }

        if (neededClasspaths.length > 0) {
            const dependenciesMatch = contents.match(/dependencies\s*{([^}]*)}/);
            if (dependenciesMatch) {
                const fullMatch = dependenciesMatch[0];
                const insertIndex = contents.indexOf(fullMatch) + fullMatch.length - 1;
                contents =
                    contents.slice(0, insertIndex) +
                    '\n        ' + neededClasspaths.join('\n        ') +
                    '\n    ' +
                    contents.slice(insertIndex);
            }
        }

        config.modResults.contents = contents;
        return config;
    });
};

const getClasspathInfo = (contents: string, classpath: string, checkVersion: boolean = false): ClasspathInfo => {
    const [groupId, artifactId, version] = classpath.split(':');

    const baseClasspath = `${groupId}:${artifactId}`;
    CleverTapLog.log("baseClasspath = " + baseClasspath);
    //const classpathRegex = new RegExp(`classpath\\s+['"]${baseClasspath}:([^'"]+)['"]`, 'g');
    //const classpathRegex = new RegExp(`classpath\\s*\\(?['"]${baseClasspath}:([^'")]+)['"]\\)?`, 'g');
    const classpathRegex = new RegExp(
        `classpath\\s*\\(?['"]${baseClasspath}(?::([^'")]+))?['"]\\)?`,
        'g'
    );

    const matches = [...contents.matchAll(classpathRegex)];
    CleverTapLog.log("matches = " + matches);
    if (matches.length > 0) {
        const match = matches[0];
        return {
            exists: true,
            currentVersion: checkVersion ? match[1] : undefined,
            lineToReplace: match[0]
        };
    }
    return { exists: false };
};

const updateClasspathVersion = (contents: string, oldLine: string, newLine: string): string => {
    return contents.replace(oldLine, newLine);
};

const addHmsRepositoryToBlock = (contents: string, blockPattern: RegExp): string => {
    const repositoriesSnippet = `maven { url "https://developer.huawei.com/repo/" }  // Required for HMS push`;

    return mergeContents({
        src: contents,
        newSrc: repositoriesSnippet,
        tag: `clevertap-repositories-${blockPattern.source}`,
        comment: '//',
        anchor: blockPattern,
        offset: 1
    }).contents;
};

const addHmsRepositoryToAllAvailableRepoBlocks = (contents: string): string => {
    const repositoryPattern = /repositories\s*{/g;
    let modifiedContents = contents;
    const huaweiRepo = 'maven { url "https://developer.huawei.com/repo/" }';

    const matches = [...modifiedContents.matchAll(repositoryPattern)];

    // Process matches in reverse order to maintain correct indices
    matches.reverse().forEach(match => {
        const endOfMatch = match.index! + match[0].length;
        const tagStart = '// @clevertap-hms-repositories-begin';
        const tagEnd = '// @clevertap-hms-repositories-end';

        // Find if there's already a tagged block for this repositories match
        const contentAfterMatch = modifiedContents.slice(endOfMatch);
        const nextRepoIndex = contentAfterMatch.search(/repositories\s*{/);
        const searchLimit = nextRepoIndex > -1 ? nextRepoIndex + endOfMatch : modifiedContents.length;
        const blockToCheck = modifiedContents.slice(endOfMatch, searchLimit);

        if (!blockToCheck.includes(tagStart)) {
            const newContent = `\n        ${tagStart}\n        ${huaweiRepo}  // Required for HMS push\n        ${tagEnd}`;
            modifiedContents =
                modifiedContents.slice(0, endOfMatch) +
                newContent +
                modifiedContents.slice(endOfMatch);
        }
    });

    return modifiedContents;
};
