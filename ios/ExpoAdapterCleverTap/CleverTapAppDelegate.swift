import ExpoModulesCore
import CleverTapSDK
import class CleverTapReact.CleverTapReactManager
import CleverTapReact.CleverTapReactCustomTemplates
import SystemConfiguration
import NotificationCenter

public class CleverTapAppDelegate: ExpoAppDelegateSubscriber, CleverTapURLDelegate, CleverTapSyncDelegate, UNUserNotificationCenterDelegate {
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
        let notificationProps = plistDict?["NotificationProps"] as? [String: Any]
        var unCategories: Set<UNNotificationCategory> = []
        
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
        
        // Register categories with UNUserNotificationCenter
        if let enablePushInForeground = notificationProps?["EnablePushInForeground"] as? Bool, enablePushInForeground {
            UNUserNotificationCenter.current().delegate = self
        }
        UNUserNotificationCenter.current().setNotificationCategories(unCategories)
        
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
    
    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        let plistDict = Bundle.main.infoDictionary
        let notificationProps = plistDict?["NotificationProps"] as? [String: Any]
        
        if let enablePushInForeground = notificationProps?["EnablePushInForeground"] as? Bool, enablePushInForeground {
            print("clevertap-expo-plugin: CleverTap will handle push in foreground")
            if #available(iOS 14.0, *) {
                completionHandler([.badge, .sound, .banner])
            } else {
                completionHandler([.badge, .sound, .alert])
            }
        } else {
            completionHandler([])
        }
    }
}

