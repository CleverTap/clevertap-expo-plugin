import ExpoModulesCore
import CleverTapSDK
import CleverTapReact
import SystemConfiguration
import NotificationCenter

public class CleverTapAppDelegate: ExpoAppDelegateSubscriber, CleverTapURLDelegate, CleverTapSyncDelegate, UNUserNotificationCenterDelegate {
    /// iOS allows only one notification delegate. Forward existing delegates used by other libraries
    /// (e.g. expo-notifications, react-native-firebase) instead of replacing them.
    /// Stored as `weak` and remain `nil` if no delegate is set.
    private weak var previousNotificationCenterDelegate: UNUserNotificationCenterDelegate?

    private var isPushInForegroundEnabled: Bool {
        let notificationProps = Bundle.main.infoDictionary?["CTExpoNotificationProps"] as? [String: Any]
        return notificationProps?["EnablePushInForeground"] as? Bool ?? false
    }
    
    public func shouldHandleCleverTap(_ url: URL?, for channel: CleverTapChannel) -> Bool {
        let plistDict = Bundle.main.infoDictionary
        if let channels = plistDict?["CTExpoURLDelegateChannels"] as? [Int32] {
            let shouldHandle = channels.contains(channel.rawValue)
            return shouldHandle
        }
        return false
    }
    
    public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        let plistDict = Bundle.main.infoDictionary
        let notificationProps = plistDict?["CTExpoNotificationProps"] as? [String: Any]
        var unCategories: Set<UNNotificationCategory> = []
        
        // Register categories with UNUserNotificationCenter
        if let notificationProps = notificationProps,
           let notificationCategories = notificationProps["NotificationCategories"] as? [[String: Any]] {
            
            notificationCategories.forEach { category in
                if let actions = category["actions"] as? [[String: Any]],
                   let identifier = category["identifier"] as? String {
                    
                    let unActions = actions.compactMap { action in
                        if let identifier = action["identifier"] as? String,
                           let titleValue = action["title"] as? String {
                            return UNNotificationAction(identifier: identifier, title: titleValue)
                        }
                        return nil
                    }
                    let unCategory = UNNotificationCategory(identifier: identifier, actions: unActions, intentIdentifiers: [], options: [])
                    unCategories.insert(unCategory)
                }
            }
        }

        let notificationCenter = UNUserNotificationCenter.current()

        // Remember the current delegate so we can forward to it. The check keeps us from
        // storing ourselves, to avoid an infinite forwarding loop.
        if let existingDelegate = notificationCenter.delegate, !(existingDelegate is CleverTapAppDelegate) {
            previousNotificationCenterDelegate = existingDelegate
        }

        // Must be called before `autoIntegrate()`. `autoIntegrate()` uses the current
        // delegate (or the next one that's set) for tap tracking, so we install ours first.
        notificationCenter.delegate = self
        notificationCenter.setNotificationCategories(unCategories)

        if let logLevel = Bundle.main.object(forInfoDictionaryKey: "CTExpoLogLevel") as? Int32 {
            CleverTap.setDebugLevel(logLevel)
        }
        
        CleverTap.autoIntegrate()
        
        if let channels = plistDict?["CTExpoURLDelegateChannels"] as? [Int32], !channels.isEmpty {
            CleverTap.sharedInstance()?.setUrlDelegate(self)
        }
                
        CleverTapReactManager.sharedInstance()?.applicationDidLaunch(options: launchOptions)
        return true
    }

    /// autoIntegrate only attaches its tap tracking to a method that already exists, so deleting it stops
    /// `CleverTapPushNotificationClicked` from ever firing.
    /// That attached code runs before this body and reports the tap
    public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let selector = #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:withCompletionHandler:))

        guard let previousDelegate = previousNotificationCenterDelegate, previousDelegate.responds(to: selector) else {
            completionHandler()
            return
        }
        // Hand over the completion handler too, so they are the ones who reply.
        previousDelegate.userNotificationCenter?(center, didReceive: response, withCompletionHandler: completionHandler)
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if isPushInForegroundEnabled {
            NSLog("clevertap-expo-plugin: CleverTap will handle push in foreground")
            if #available(iOS 14.0, *) {
                completionHandler([.badge, .sound, .banner, .list])
            } else {
                completionHandler([.badge, .sound, .alert, .list])
            }
            return
        }
        // Disabled, but iOS still asks us because we own the delegate. Forward to the replaced
        // delegate so its foreground notification handling is preserved.
        let selector = #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:willPresent:withCompletionHandler:))
        guard let previousDelegate = previousNotificationCenterDelegate, previousDelegate.responds(to: selector) else {
            // No one to ask and foreground push was not requested.
            completionHandler([])
            return
        }
        previousDelegate.userNotificationCenter?(center, willPresent: notification, withCompletionHandler: completionHandler)
    }
}
