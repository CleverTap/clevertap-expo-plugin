---
name: example-and-release
description: How to finish a CleverTap Expo plugin release sync — update the CTExample app (app.json + package.json), showcase any NEW clevertap-react-native APIs as runnable demo buttons in CTExample, append a row to the README compatibility matrix, write the CHANGELOG entry in the exact existing format, choose the plugin's semver bump, and verify with the compile-only build loop (yalc + expo prebuild + gradle/xcodebuild). Use at the end of a release sync.
---

# Example app + release finishing steps

The tail of a release sync: keep the example app current, document the change, bump
the plugin version, and verify it compiles. Match the EXISTING formats exactly —
downstream tooling and humans expect them.

## 1. CTExample app

`CTExample/` is the example Expo app; it consumes the plugin via **yalc**
(`"@clevertap/clevertap-expo-plugin": "file:.yalc/@clevertap/clevertap-expo-plugin"`
plus `"expo": { "autolinking": { "nativeModulesDir": ".." } }`).

- `CTExample/package.json` — bump `clevertap-react-native` to match the target
  `${RN_VERSION}`, and `expo` / `react-native` to match the target Expo SDK (use the
  react-native version that ships with that Expo SDK, from `expo-sdk-analysis`).
- `CTExample/app.json` — if the sync added a new feature flag / config field, reflect
  it in the plugin config block so the demo keeps exercising it. Don't change the test
  credentials.

## 1b. Showcase NEW clevertap-react-native APIs in CTExample

The plugin itself surfaces no SDK methods — but the CTExample app is a living showcase,
so when the target `clevertap-react-native` release adds **new public APIs**, add a
runnable demo button for each so the example stays current. These are pure JS edits in
the example app (no plugin/native code).

**Where the new APIs come from:** the `clevertap-react-native` changelog's **"API changes"**
section (available in `expo-diff.json` → `changelogs.rn`). It lists each new method with
its exact signature, e.g. `fetchInbox(callback?)`, `pushDisplayUnitElementClickedEventForID(unitID, additionalProperties)`.
Only surface entries under "API changes" (or clearly-new public methods) — NOT bug fixes
or internal changes.

**Source-verify before adding (IMPORTANT):** a wrong method name becomes a runtime-broken
button (the native compile gate will NOT catch it — JS isn't type-checked there). Confirm
the method actually exists in `clevertap-react-native` at the target version. The
authoritative sources are (a) the changelog's "API changes" section, which states the exact
new method + signature for that release, and (b) the RN repo's `src/index.js` / `index.d.ts`
**at the `${RN_VERSION}` tag** via WebFetch (`https://raw.githubusercontent.com/CleverTap/clevertap-react-native/${RN_VERSION}/src/index.js`).
Do NOT rely on `CTExample/node_modules/clevertap-react-native` — during the sync it still
holds the PRE-sync version (the target version is only installed in the later post-sync
build), so a genuinely-new method won't be there yet. If you can't confirm a method from
the changelog or the tagged source, do NOT add a demo for it — flag it instead.

**The 3-file demo pattern (match the existing entries exactly):**
1. `CTExample/constants.js` — add a key to the `Actions` object: `NEW_API_KEY: 'NEW_API_KEY',`.
2. `CTExample/App.js` —
   - add `{ action: Actions.NEW_API_KEY, name: '<methodName>' }` to the `subCategory` of the
     most relevant existing `accordionData` category (e.g. App Inbox, Native Display, Events);
   - add a `case Actions.NEW_API_KEY:` in the `handleItemAction` switch that calls
     `CleverTap.<method>(...)` with **realistic sample args**, then `break;`.
3. `CTExample/app-utils.js` — only for multi-step or feedback-bearing demos: add an
   `export const <helper> = () => { ... showToast(...) + console.log(...) + CleverTap.<method>(...) }`
   and call `AppUtils.<helper>()` from the switch (simple fire-and-forget calls can go inline
   in the switch, like `CleverTap.suspendInAppNotifications()`).

Use `const CleverTap = require('clevertap-react-native')` (already imported in App.js).
For callback-style APIs, pass a callback that `console.log`s the result, mirroring existing
cases like `getVariables` / `fetchVariables`. Example for the 4.2.0 additions:
```js
// constants.js
FETCH_INBOX: 'FETCH_INBOX',
// App.js — App Inbox category subCategory
{ action: Actions.FETCH_INBOX, name: 'fetchInbox' },
// App.js — handleItemAction switch
case Actions.FETCH_INBOX:
  CleverTap.fetchInbox((err, success) => { console.log('fetchInbox result:', success, err); });
  break;
```

Record each demoed API in the `apis_demoed` output field. These edits to
`constants.js` / `App.js` / `app-utils.js` are real source changes and DO belong in the PR.

## 2. README compatibility matrix

`README.md` has a table:

```
| CleverTap Expo Plugin version | Expo SDK version | React Native version | CleverTap React Native SDK version |
```

Append ONE new row for this release: `| <new plugin version> | <Expo SDK> | <react-native> | ${RN_VERSION} |`.
Also update any "Expo NN+ Migration" notes if the Expo jump introduced a new
`app.json` migration (e.g. the SDK-55 `notification.icon` → `android.notificationIcon`).

## 3. CHANGELOG.md

New entry at the **TOP**, matching the existing format exactly:

```markdown
### [Version X.Y.Z](https://github.com/CleverTap/clevertap-expo-plugin/releases/tag/X.Y.Z) (Month DD, YYYY)

#### Added
- Adds support for Expo SDK [<v>](https://expo.dev/changelog/sdk-<v>) and React Native [<rn>](...)
- Adds support for CleverTap React Native SDK [${RN_VERSION}](...)

#### Android Platform ####
  - <integration-step change, if any>

#### iOS Platform ####
  - <integration-step change, if any>
```

Use `${RELEASE_DATE}` for the date. Derive version-anchor links from the changelog
dates in `expo-diff.json` (no need to fetch). Only include `#### Android/iOS Platform`
subsections if there were integration-step changes on that platform.

## 4. Plugin semver bump (`package.json` `version`)

This is the single canonical version file the PR completeness check looks for. Choose:

- **patch** (1.0.x) — dependency version pins only; no new feature/integration step;
  no breaking Expo/RN change.
- **minor** (1.x.0) — a new feature flag, a new `compileOnly` dep, or a new additive
  integration step; backward compatible. (Most common.)
- **major** (x.0.0) — a removed feature/step, an Android `minSdk` or iOS
  deployment-target bump propagated to host apps, an `app.json` field removal that
  breaks existing configs, or a breaking `@expo/config-plugins` adoption.

The plugin's own version is independent of the native SDK versions it pins.

## 5. Verify — compile-only build loop

CI does this for you (the `build/expo` composite). Locally, to verify the plugin
compiles after edits:

```bash
npm run build           # compile the plugin (output to build/)
yalc publish            # publish to the local yalc store
cd CTExample
yalc add @clevertap/clevertap-expo-plugin
npm install
npx expo prebuild --clean       # regenerate native projects from app.json + plugin
cd android && ./gradlew :app:assembleDebug   # Android compile
cd ../ios && pod install && xcodebuild -workspace CTExample.xcworkspace -scheme CTExample -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build   # iOS compile
```

CI is **compile-only** (no emulator/simulator boot) to fit the 90-min job timeout —
it proves the plugin's generated native config compiles. For device-level behavior
testing (SDK init, event recording) use the `ctexample-testing` skill on an emulator
locally; that is NOT part of the automated sync gate.

After an iOS-affecting change, delete `CTExample/ios/Podfile.lock` before `pod install`
so the (transitively-floating) `CleverTap-iOS-SDK` re-resolves.

## Completion checklist

- [ ] `CTExample/package.json` (+ `app.json` if a field was added) updated.
- [ ] README compatibility matrix has a new row.
- [ ] `CHANGELOG.md` has a new dated entry at the top, correct format.
- [ ] `package.json` `version` bumped per semver.
- [ ] The plugin compiles (the CI build gate, or the loop above).
