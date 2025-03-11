#if canImport(CTNotificationContent)
import CTNotificationContent
import CleverTapSDK

class NotificationViewController: CTNotificationViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    // optional: implement to get user event data
    override func userDidPerformAction(_ action: String, withProperties properties: [AnyHashable : Any]!) {
        print("userDidPerformAction \(action) with props \(String(describing: properties))")
    }
    
    // optional: implement to get notification response
    override func userDidReceive(_ response: UNNotificationResponse?) {
        print("Push Notification Payload \(String(describing: response?.notification.request.content.userInfo))")
    }
}
#endif
