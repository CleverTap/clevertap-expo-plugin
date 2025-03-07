#if canImport(CTNotificationService)
import CTNotificationService
import CleverTapSDK

class NotificationService: CTNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    getUserDefaults(request)
    super.didReceive(request, withContentHandler: contentHandler)
  }
}

func getUserDefaults(_ request: UNNotificationRequest) {
  guard let ctExpo = Bundle.main.object(forInfoDictionaryKey: "CTExpo") as? [String: Any],
        let appGroup = ctExpo["AppGroup"] as? String else {
    print("CTExpo and AppGroup key not found: - Not logging Push Impression")
    return
  }
  
  let defaults = UserDefaults(suiteName: appGroup)
  
  let profilename = defaults?.string(forKey: "CTProfileName")
  let profileEmail = defaults?.string(forKey: "CTProfileEmail")
  let profileIdentity = defaults?.string(forKey: "CTProfileIdentity")
  let profilePhone = defaults?.string(forKey: "CTProfilePhone") //should this be string ??
  
  var profileDict: [String: String]
  if let useCustomId = ctExpo["CleverTapUseCustomId"] as? Bool,
     useCustomId,
     let customIds = ctExpo["CleverTapIdentifiers"] as? [String] {
    
    //test custom identity
    profileDict = Dictionary(uniqueKeysWithValues: customIds.compactMap { key in
        defaults?.string(forKey: key).map { (key, $0) }
    })
    print(profileDict)
  } else {
    profileDict = ["Name": profilename, "Email": profileEmail, "Identity": profileIdentity, "Phone": profilePhone].compactMapValues { $0 }
  }
  
  if !profileDict.isEmpty {
    CleverTap.sharedInstance()?.profilePush(profileDict)
    CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
  } else {
    print("CTProfile not found: - Not logging Push Impression")
  }
}
#endif
