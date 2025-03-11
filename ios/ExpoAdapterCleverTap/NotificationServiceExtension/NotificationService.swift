#if canImport(CTNotificationService)
import CleverTapSDK
import CTNotificationService

class NotificationService: UNNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    super.didReceive(request, withContentHandler: contentHandler)
  }
}

func getUserDefaults(_ request: UNNotificationRequest) {
  if let appGroup = Bundle.main.object(forInfoDictionaryKey: "CTEXPO_PUSH_APP_GROUP") as? String {
        
        let defaults = UserDefaults(suiteName: appGroup)
        let profilename = defaults?.string(forKey: "CTProfileName")
        let profileEmail = defaults?.string(forKey: "CTProfileEmail")
        let profileIdentity = defaults?.string(forKey: "CTProfileIdentity")
        let profilePhone = defaults?.string(forKey: "CTProfilePhone")
        
        var profileDict = ["Name": profilename, "Email": profileEmail, "Identity": profileIdentity, "Phone": profilePhone].compactMapValues { $0 }
        
        if !profileDict.isEmpty {
            CleverTap.sharedInstance()?.profilePush(profileDict)
        }
    }
    CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
}
#endif
