# Configurable Dependency Versions

## Overview

The CleverTap Expo Plugin supports configurable dependency versions, allowing you to override any Android dependency version or iOS constant from your `app.json` configuration. This feature solves compatibility issues between CleverTap and other packages and provides complete control over dependency versions.

## Current Status

### ✅ Android Dependency Versions - Fully Functional
All Android dependency version overrides are working correctly. Users can override any dependency version through `app.json` configuration.

### 🚧 iOS Version Overrides - Partially Functional  
- ✅ **Deployment Target**: Managed by Expo's iOS configuration (working as expected)
- ❌ **Bundle Versions**: Extension bundle versions not applying user overrides
- ✅ **Package Resolution**: Smart directory detection for local development scenarios
- ✅ **Backwards Compatibility**: Works without `versions` property

## Benefits

- **Resolve Version Conflicts**: Override specific dependency versions to fix compatibility issues
- **Future-Proof**: Control dependency versions as new packages are added to your project
- **Flexibility**: Partial or complete version overrides as needed
- **Type-Safe**: Full TypeScript support with IntelliSense
- **Backwards Compatible**: Existing configurations continue to work unchanged

## Android Dependency Versions

### Configuration

Add `dependencyVersions` to your Android configuration in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@clevertap/clevertap-expo-plugin",
        {
          "android": {
            "features": {
              "enablePush": true,
              "enableInbox": true
            },
            "dependencyVersions": {
              "media3": {
                "media3Version": "1.5.0"
              },
              "clevertapCore": {
                "clevertapCoreSdkVersion": "7.2.0",
                "androidxCoreVersion": "1.10.0" 
              }
            }
          }
        }
      ]
    ]
  }
}
```

### Available Android Dependencies

#### Core Dependencies
| Property | Default Value | Description |
|----------|---------------|-------------|
| `clevertapCore.clevertapCoreSdkVersion` | `7.1.2` | CleverTap Android SDK version |
| `clevertapCore.androidxCoreVersion` | `1.9.0` | AndroidX Core library version |

#### Push Notifications
| Property | Default Value | Description |
|----------|---------------|-------------|
| `pushNotifications.firebaseMessagingVersion` | `23.0.6` | Firebase Cloud Messaging version |

#### Push Templates
| Property | Default Value | Description |
|----------|---------------|-------------|
| `pushTemplates.clevertapPushTemplatesSdkVersion` | `1.2.4` | CleverTap Push Templates SDK version |

#### In-App Messaging
| Property | Default Value | Description |
|----------|---------------|-------------|
| `inApp.appCompatVersion` | `1.6.0-rc01` | AndroidX AppCompat library version |
| `inApp.fragmentVersion` | `1.3.6` | AndroidX Fragment library version |

#### App Inbox
| Property | Default Value | Description |
|----------|---------------|-------------|
| `inbox.appCompatVersion` | `1.6.0-rc01` | AndroidX AppCompat library version |
| `inbox.recyclerViewVersion` | `1.2.1` | AndroidX RecyclerView library version |
| `inbox.viewPagerVersion` | `1.0.0` | AndroidX ViewPager library version |
| `inbox.materialVersion` | `1.4.0` | Material Design Components version |
| `inbox.glideVersion` | `4.12.0` | Glide image loading library version |
| `inbox.fragmentVersion` | `1.3.6` | AndroidX Fragment library version |

#### Media Support
| Property | Default Value | Description |
|----------|---------------|-------------|
| `media3.media3Version` | `1.4.1` | AndroidX Media3 library version |

#### Install Referrer
| Property | Default Value | Description |
|----------|---------------|-------------|
| `installReferrer.installReferrerVersion` | `2.2` | Google Play Install Referrer library version |

#### HMS Push (Huawei)
| Property | Default Value | Description |
|----------|---------------|-------------|
| `hmsPush.clevertapHmsSdkVersion` | `1.3.4` | CleverTap HMS SDK version |
| `hmsPush.hmsPushVersion` | `6.11.0.300` | Huawei Push Services version |

#### Google Ad ID
| Property | Default Value | Description |
|----------|---------------|-------------|
| `googleAdId.playServicesAdsVersion` | `18.2.0` | Google Play Services Ads Identifier version |

### Tested Examples

#### ✅ Successfully Tested Configurations

**Example 1: Single Dependency Override**
```json
{
  "android": {
    "dependencyVersions": {
      "media3": {
        "media3Version": "1.4.1"
      }
    }
  }
}
```
**Result**: `media3Version=1.4.1` in gradle.properties, all other defaults unchanged.

**Example 2: Multiple Category Override**
```json
{
  "android": {
    "dependencyVersions": {
      "media3": { "media3Version": "1.5.0" },
      "clevertapCore": { 
        "clevertapCoreSdkVersion": "7.2.0",
        "androidxCoreVersion": "1.10.0" 
      },
      "pushNotifications": { "firebaseMessagingVersion": "24.0.0" }
    }
  }
}
```
**Result**: All specified versions applied, unmodified categories use defaults.

**Example 3: No Overrides (Backwards Compatibility)**
```json
{
  "android": {
    "features": { "enablePush": true }
    // No dependencyVersions property
  }
}
```
**Result**: All default versions applied correctly.

### Common Android Use Cases

#### Update Media3 Version
```json
{
  "android": {
    "dependencyVersions": {
      "media3": {
        "media3Version": "1.5.0"
      }
    }
  }
}
```

#### Update Core SDK
```json
{
  "android": {
    "dependencyVersions": {
      "clevertapCore": {
        "clevertapCoreSdkVersion": "7.2.0"
      }
    }
  }
}
```

#### Comprehensive Version Override
```json
{
  "android": {
    "dependencyVersions": {
      "clevertapCore": {
        "clevertapCoreSdkVersion": "7.2.0",
        "androidxCoreVersion": "1.10.0"
      },
      "pushNotifications": {
        "firebaseMessagingVersion": "24.0.0"
      },
      "media3": {
        "media3Version": "1.5.0"
      }
    }
  }
}
```

## iOS Version Overrides

### Configuration

Add `versions` to your iOS configuration in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@clevertap/clevertap-expo-plugin",
        {
          "ios": {
            "mode": "development",
            "versions": {
              "deploymentTarget": "12.0",
              "targetedDeviceFamily": "1",
              "defaultBundleVersion": "2",
              "defaultBundleShortVersion": "2.0"
            }
          }
        }
      ]
    ]
  }
}
```

### Available iOS Constants

| Property | Default Value | Description |
|----------|---------------|-------------|
| `deploymentTarget` | `"11.0"` | iOS deployment target version |
| `targetedDeviceFamily` | `"1,2"` | Device family (1=iPhone, 2=iPad, "1,2"=Universal) |
| `defaultBundleVersion` | `"1"` | Default bundle version for extensions |
| `defaultBundleShortVersion` | `"1.0"` | Default bundle short version for extensions |

### Common iOS Use Cases

#### Update Deployment Target
```json
{
  "ios": {
    "versions": {
      "deploymentTarget": "12.0"
    }
  }
}
```

#### iPhone Only App
```json
{
  "ios": {
    "versions": {
      "targetedDeviceFamily": "1"
    }
  }
}
```

## Testing Your Configuration

### 1. Prebuild Verification

After updating your `app.json`, run a clean prebuild:

```bash
npx expo prebuild --clean
```

#### Android Verification
Check that your version overrides appear in `android/gradle.properties`:

```properties
# Your overrides should appear here
media3Version=1.5.0
clevertapCoreSdkVersion=7.2.0
```

And are used in `android/app/build.gradle`:

```gradle
implementation("androidx.media3:media3-exoplayer:${project.findProperty('media3Version') ?: '1.5.0'}")
```

#### iOS Verification
For iOS, check that your bundle versions are properly applied to extension targets in the Xcode project.

### 2. Build Verification

Test that your app builds successfully:

```bash
# Android
npm run android

# iOS  
npm run ios
```

### 3. Version Conflict Testing

If you're fixing a specific version conflict:

1. **Before**: Document the exact error message
2. **Apply Override**: Add the version override to `app.json`
3. **Clean Build**: Run `npx expo prebuild --clean`
4. **Verify Fix**: Confirm the build succeeds and the error is resolved

## Troubleshooting

### Build Failures After Version Override

1. **Check Version Compatibility**: Ensure the version you're overriding to is compatible with other dependencies
2. **Verify Version Exists**: Confirm the version number exists in the respective package repository
3. **Review Logs**: Check build logs for specific dependency conflicts
4. **Gradual Updates**: Try updating one version at a time to isolate issues

### Version Not Applied

1. **Clean Build**: Always run `npx expo prebuild --clean` after configuration changes
2. **Check Syntax**: Verify your `app.json` syntax is correct
3. **Case Sensitivity**: Ensure property names match exactly (case-sensitive)
4. **Nested Structure**: Verify the nested object structure matches the documentation

### iOS Package Resolution Issues (Local Development)

If you encounter `Error: Cannot find module '@clevertap/clevertap-expo-plugin/package.json'` when using iOS extensions with local plugin development:

1. **Using file: paths**: This is expected when using `"@clevertap/clevertap-expo-plugin": "file:../path"` in package.json
2. **Smart Detection**: The plugin automatically detects and handles both npm and local scenarios
3. **No Action Required**: The plugin includes fallback logic for local development
4. **Extensions Created**: iOS extensions should still be created successfully despite the different path resolution

### Common Error Messages

#### "Could not find [dependency] version [x.x.x]"
- The version number you specified doesn't exist
- Check the official repository for available versions
- Try a different version number

#### "Version [x.x.x] of [dependency] is not compatible with [other-dependency]"
- Version conflict between dependencies
- Check compatibility matrices for the packages
- Try intermediate versions

#### "Property [propertyName] does not exist"
- Typo in the property name
- Check the documentation for exact property names
- Ensure you're using the correct nested structure

## Version Compatibility Guide

### Tested Version Combinations

#### Android Media3 Versions
| media3Version | Release Date | Compatibility Notes |
|---------------|--------------|---------------------|
| 1.5.0+ | Latest | Most recent features |
| 1.4.1 | Stable | Recommended for compatibility |
| 1.1.1 | Legacy | Default, may have compatibility issues with newer packages |

#### CleverTap Core SDK Compatibility
| CleverTap Core | Min Android API | Min iOS |
|----------------|-----------------|---------|
| 7.2.0+ | API 21+ | iOS 11.0+ |
| 7.1.x | API 19+ | iOS 11.0+ |

### Recommended Update Strategy

1. **Start Conservative**: Begin with minor version updates
2. **Test Thoroughly**: Test each major dependency update individually  
3. **Update Gradually**: Don't update all dependencies simultaneously
4. **Monitor Logs**: Watch for deprecation warnings and compatibility issues
5. **Keep Documentation**: Document your version overrides and reasons

## Migration Guide

### From Hardcoded Versions

If you were previously modifying plugin source code or gradle files:

1. **Remove Manual Changes**: Revert any manual modifications to plugin files
2. **Add Configuration**: Use the `dependencyVersions` configuration instead
3. **Clean Build**: Run `npx expo prebuild --clean`
4. **Verify**: Confirm versions are applied correctly

### From Previous Plugin Versions

This feature is backwards compatible. Existing configurations will continue to work unchanged. You can gradually adopt version overrides as needed.

## Advanced Usage

### Environment-Specific Versions

You can use different versions for different environments:

```json
{
  "expo": {
    "plugins": [
      [
        "@clevertap/clevertap-expo-plugin",
        {
          "android": {
            "dependencyVersions": {
              "clevertapCore": {
                "clevertapCoreSdkVersion": process.env.NODE_ENV === "development" ? "7.2.0-beta" : "7.1.2"
              }
            }
          }
        }
      ]
    ]
  }
}
```

### Conditional Version Overrides

Override versions only when specific conditions are met:

```javascript
// app.config.js
const clevertapConfig = {
  accountId: "YOUR_ACCOUNT_ID",
  accountToken: "YOUR_TOKEN",
  android: {
    features: {
      enablePush: true,
      enableInbox: true
    }
  }
};

// Add version overrides if a specific package requiring newer media3 is installed
const packageJson = require('./package.json');
if (packageJson.dependencies['some-media-package']) {
  clevertapConfig.android.dependencyVersions = {
    media3: {
      media3Version: "1.5.0"
    }
  };
}

export default {
  expo: {
    plugins: [
      ["@clevertap/clevertap-expo-plugin", clevertapConfig]
    ]
  }
};
```

## Support

If you encounter issues with dependency versions:

1. **Check This Documentation**: Ensure you're following the correct configuration format
2. **Review Build Logs**: Look for specific error messages in your build output
3. **Test Incrementally**: Try version changes one at a time
4. **Community Support**: Reach out to the CleverTap community with specific error details

For questions or issues specific to the configurable versions feature, please include:
- Your complete `app.json` configuration
- Build error logs
- Package versions (`npm list` or `yarn list`)
- Platform and environment details