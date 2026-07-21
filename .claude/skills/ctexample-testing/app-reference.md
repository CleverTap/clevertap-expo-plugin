# CTExample App — UI & Maestro Reference

This file maps the CTExample app's UI elements to their **exact Maestro text targets**, form placeholders, and the CleverTap API each section exercises. Use this when writing new Maestro flows.

---

## 1. Accordion Sections

The app uses an `ExpandableListView` component. Each section header is a red bar with white text. Tapping expands/collapses it.

| Section Header | Maestro Target | CleverTap API |
|---------------|---------------|---------------|
| Record Event | `"Record Event"` | `CleverTap.recordEvent(name, props)` |
| Update User | `"Update User"` | `CleverTap.profileSet(profile)` |
| User Properties | `"User Properties"` | `profileSetMultiValues`, `profileAddMultiValue`, `profileIncrementValue` |
| Identity Management | `"Identity Management"` | `CleverTap.onUserLogin(profile)`, `CleverTap.getCleverTapID()` |
| Location | `"Location"` | `CleverTap.setLocation(lat, lng)`, `CleverTap.profileSet({Locale})` |
| Events | `"Events"` | `CleverTap.recordEvent()`, `CleverTap.recordChargedEvent()` |
| Product Experiences: Vars | `"Product Experiences: Vars"` | `CleverTap.defineVariables()`, `CleverTap.syncVariables()`, `CleverTap.fetchVariables()` |
| Push Notifications | `"Push Notifications"` | `CleverTap.createNotificationChannel()`, `CleverTap.createNotification()` |
| App Inbox | `"App Inbox"` | `CleverTap.initializeInbox()`, `CleverTap.showInbox()` |
| Push Templates | `"Push Templates"` | Push template rendering |
| Push Primer Local InApp | `"Push Primer Local InApp"` | `CleverTap.promptPushPrimer()`, `CleverTap.promptForPushPermission()` |
| InApp Controls | `"InApp Controls"` | `CleverTap.suspendInAppNotifications()`, `CleverTap.resumeInAppNotifications()` |

---

## 2. Form Elements

### Record Event Form

| Element | Maestro Target | Purpose |
|---------|---------------|---------|
| Name input | `"Enter event name"` | Event name passed to `recordEvent()` |
| Add param button | `"Add param"` | Adds key-value pair fields |
| Param key input | `"Param key"` | Key for event property |
| Param value input | `"Param value"` | Value for event property |
| Submit button | `"Record event"` | Calls `CleverTap.recordEvent(name, props)` |

### Update User Form

| Element | Maestro Target | Purpose |
|---------|---------------|---------|
| Name input | `"Enter profile name"` | Profile property name |
| Add param button | `"Add param"` | Adds key-value pair fields |
| Submit button | `"Update user"` | Calls `CleverTap.profileSet()` |

---

## 3. Source Files

| File | Purpose |
|------|---------|
| `CTExample/App.js` | Main component — accordion data, form configs, CleverTap listeners, event handlers |
| `CTExample/app-utils.js` | Helper functions — `recordEvent()`, `pushEvent()`, `chargedEvent()`, listener setup |
| `CTExample/constants.js` | Action constants — all action type strings (e.g. `RECORD_EVENT`, `PUSH_EVENT`) |
| `CTExample/DynamicForm.js` | Reusable form component — renders name input + dynamic key-value params |
| `CTExample/ExpandableListView.js` | Accordion UI component — expandable sections with action buttons |
| `CTExample/app.json` | Plugin configuration — account ID, token, region, features, notification settings |

---

## 4. App Configuration (app.json)

The plugin config in `CTExample/app.json` under `plugins` → `@clevertap/clevertap-expo-plugin`:

| Config Key | Test Value | Notes |
|-----------|-----------|-------|
| `accountId` | `"TEST-46W-WWR-R85Z"` | Test account — server rejects requests |
| `accountToken` | Test token | Paired with test account ID |
| `accountRegion` | `"eu1"` | EU region |
| `logLevel` | `3` | Verbose logging |
| `android.features.enablePush` | `true` | FCM push enabled |
| `android.features.enableHmsPush` | `false` | HMS push disabled |

---

## 5. Maestro Flow Patterns

### Basic: Tap a section and interact

```yaml
appId: com.clevertap.expo.demo
---
- launchApp
- waitForAnimationToEnd
- tapOn: "Section Name"
- waitForAnimationToEnd
- tapOn: "Input placeholder"
- inputText: "value"
- tapOn: "Submit button text"
```

### With parameters: Record event with key-value props

```yaml
appId: com.clevertap.expo.demo
---
- launchApp
- waitForAnimationToEnd
- tapOn: "Record Event"
- waitForAnimationToEnd
- tapOn: "Enter event name"
- inputText: "Purchase"
- tapOn: "Add param"
- tapOn: "Param key"
- inputText: "item"
- tapOn: "Param value"
- inputText: "shirt"
- tapOn: "Record event"
```

### Scrolling to off-screen sections

```yaml
- scrollUntilVisible:
    element: "InApp Controls"
    direction: DOWN
```
