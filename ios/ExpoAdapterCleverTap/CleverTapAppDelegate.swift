import ExpoModulesCore
import CleverTapSDK
import class CleverTapReact.CleverTapReactManager
import SystemConfiguration
import NotificationCenter

public class CleverTapAppDelegate: ExpoAppDelegateSubscriber, CleverTapURLDelegate, UNUserNotificationCenterDelegate {
    public func shouldHandleCleverTap(_ url: URL?, for channel: CleverTapChannel) -> Bool {
        let plistDict = Bundle.main.infoDictionary
        
        if let channels = plistDict?["CTExpoURLDelegateChannels"] as? [Int32] {
            let shouldHandle = channels.contains(channel.rawValue)
            return shouldHandle
        }
        return false
    }
    
    struct NotificationCategory {
        let identifier: String
        let actions: [NotificationAction]?
    }
    
    struct NotificationAction {
        let identifier: String
        let title: String
    }
    
    public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        let plistDict = Bundle.main.infoDictionary
        let notificationProps = plistDict?["NotificationProps"] as? [String: Any]
        var unCategories: Set<UNNotificationCategory> = []
        
        // Register categories with UNUserNotificationCenter
        UNUserNotificationCenter.current().setNotificationCategories(unCategories)
        
        if let notificationProps = notificationProps,
           let notificationCategories = notificationProps["NotificationCategories"] as? [NotificationCategory] {
            
            notificationCategories.forEach { category in
                let unActions = category.actions?.map { action in
                    UNNotificationAction(identifier: action.identifier, title: action.title, options: [])
                } ?? []
                
                let unCategory = UNNotificationCategory(identifier: category.identifier, actions: unActions, intentIdentifiers: [], options: [])
                unCategories.insert(unCategory)
            }
        }
        print(unCategories)
        
        // Register categories with UNUserNotificationCenter
        UNUserNotificationCenter.current().setNotificationCategories(unCategories)
        
        // register category with actions
        //                let action1 = UNNotificationAction(identifier: "action_1", title: "Back", options: [])
        //                let action2 = UNNotificationAction(identifier: "action_2", title: "Next", options: [])
        //                let action3 = UNNotificationAction(identifier: "action_3", title: "View In App", options: [])
        //                let category = UNNotificationCategory(identifier: "CTNotification", actions: [action1, action2, action3], intentIdentifiers: [], options: [])
        //                UNUserNotificationCenter.current().setNotificationCategories([category])
        
//        if let channels = plistDict?["CTExpoURLDelegateChannels"] as? [Int32], channels.count > 0 {
            // Set the URL Delegate
        CleverTap.autoIntegrate()

            CleverTap.sharedInstance()?.setUrlDelegate(self)
//        }
//        CleverTapReactCustomTemplates registerCustomTemplates("")
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
