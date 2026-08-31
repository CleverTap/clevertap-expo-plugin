---
name: ctexample-testing
description: Runs end-to-end tests on the CTExample app using Maestro and ADB against a running Android emulator. Verifies CleverTap SDK initialization, event recording, and log output after plugin changes. Use when the user asks to test the example app, verify plugin changes on device, or check CleverTap SDK behavior on the emulator.
---

# CTExample App — Testing Guide

## Additional Resources

- [App UI Reference](app-reference.md) — Accordion menu sections, Maestro text targets, form element placeholders, and logcat verification patterns
- [CleverTap Expo Plugin Dev Skill](../clevertap-expo-plugin-dev/SKILL.md) — Plugin architecture and development patterns

---

## I. App Identity

| Property | Value |
|----------|-------|
| Package | `com.clevertap.expo.demo` |
| Main Activity | `.MainActivity` |
| Debug Level | `3` (verbose — set in `CTExample/App.js` constructor) |
| Plugin Dependency | `"@clevertap/clevertap-expo-plugin": "file:.yalc/@clevertap/clevertap-expo-plugin"` |
| Autolinking | `"nativeModulesDir": ".."` (resolves native module from plugin root) |

---

## II. Setup Workflow

Before running any test, the plugin must be built, published via yalc, and the app must be running on an emulator with Metro connected.

### 1. Build and publish the plugin

```bash
npm run build
yalc publish
```

### 2. Link to CTExample

```bash
cd CTExample
yalc add @clevertap/clevertap-expo-plugin
npm install
```

### 3. Prebuild and run

```bash
npx expo prebuild --clean --platform android
npx expo run:android
```

### 4. Verify prebuild output

Inspect the generated `android/` directory:

| File | What to Check |
|------|--------------|
| `gradle.properties` | Version properties match `constants.ts` |
| `app/build.gradle` | Dependency versions and feature flags |
| `app/src/main/AndroidManifest.xml` | Metadata entries (account ID, token, region) |
| `build.gradle` (root) | Classpaths (Google Services, HMS if enabled) |

### 5. Push subsequent changes

After further plugin edits, push without re-adding:

```bash
# From plugin root
npm run build && yalc push
# CTExample picks up changes automatically via .yalc link
```

---

## III. Running Tests with Maestro

Maestro is used for UI automation. Write flows as YAML, execute with `maestro test`.

### General Pattern

```bash
# 1. Clear logcat
adb logcat -c

# 2. Run Maestro flow
~/.maestro/bin/maestro test /tmp/test-flow.yaml

# 3. Verify via logcat
adb logcat -d | grep -i "CleverTap" | grep -iE "PATTERN"

# 4. Capture screenshot (optional)
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png /tmp/screen.png
```

### Restarting the App

If the app is on the wrong screen or showing an error overlay, force restart:

```bash
adb shell am force-stop com.clevertap.expo.demo
adb shell am start -n com.clevertap.expo.demo/.MainActivity
```

**Do NOT use Maestro's `launchApp` without Metro running** — it cold-starts the app, which crashes if the JS bundle can't be loaded.

---

## IV. Test: Record Event

### Maestro Flow

```yaml
appId: com.clevertap.expo.demo
---
- launchApp
- waitForAnimationToEnd
- tapOn: "Record Event"
- waitForAnimationToEnd
- tapOn: "Enter event name"
- inputText: "TestEvent"
- tapOn: "Record event"
```

### Verification

```bash
adb logcat -d | grep -i "CleverTap" | grep -iE "Pushing event onto queue|Processing batch|Send queue contains"
```

**Expected output:**

```
CleverTap:ACCT_ID: Pushing event onto queue flush sync
CleverTap:ACCT_ID: Processing batch of N events
CleverTap:ACCT_ID: Send queue contains N items: [{...}]
```

The `Send queue contains` line includes the full JSON payload. Look for:
- `"evtName":"TestEvent"` — confirms the event was recorded
- `"SDK Version":NNNNN` — confirms SDK version (e.g. `80000` = v8.0.0)
- `"type":"event"` — confirms it's an event (not profile/ping)

**Send failure is expected** with test credentials — the SDK queues and attempts to send, but the server rejects the test account. The event reaching the queue confirms the SDK is working.

---

## V. Logcat Verification Patterns

| What to Verify | Grep Pattern | Success Indicator |
|---------------|-------------|-------------------|
| SDK initialized | `CleverTapProfileDidInitialize` | Log contains a CleverTap ID |
| Event queued | `Pushing event onto queue` | Appears after recording an event |
| Batch sent | `Processing batch of` | Shows count of events in batch |
| Queue payload | `Send queue contains` | Full JSON with event names, SDK version |
| FCM token registered | `action.*register.*fcm` | Token string present |
| Inbox ready | `CleverTapInboxDidInitialize` | Appears on app launch |
| SDK version | `SDK Version` | Numeric: `80000` = v8.0.0, `75200` = v7.5.2 |

---

## VI. Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|------------|
| "Unable to load script" on app launch | Metro bundler not running | `cd CTExample && npx react-native start --port 8081`, then force restart app |
| Maestro "Element not found" | App on wrong screen (home, error overlay, splash) | Force restart: `adb shell am force-stop com.clevertap.expo.demo && adb shell am start -n com.clevertap.expo.demo/.MainActivity` |
| Maestro can't tap RN error overlay buttons | Error overlay uses custom rendering invisible to accessibility | Force restart the app instead of trying to tap RELOAD |
| Events queued but send fails | Test account credentials rejected by server | **Expected behavior** — SDK is working correctly |
| `processDebugGoogleServices` build failure | Empty or invalid `google-services.json` | Add valid Firebase config to `CTExample/assets/google-services.json` |
| Metro running but app still crashes | Metro started from wrong directory | Must run from `CTExample/`, not plugin root |
