#if canImport(CTNotificationService)
import CleverTapSDK
import CTNotificationService

class NotificationService: UNNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
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
  let profilePhone = defaults?.string(forKey: "CTProfilePhone")
  
  var profileDict = ["Name": profilename, "Email": profileEmail, "Identity": profileIdentity, "Phone": profilePhone].compactMapValues { $0 }
  
  if let useCustomId = ctExpo["CleverTapUseCustomId"] as? String,
     useCustomId == "true",
     let customId = ctExpo["CleverTapIdentifiers"] as? String {
     
    let customIds = customId.components(separatedBy: " ")
    
    let customProfileDict = Dictionary(uniqueKeysWithValues: customIds.compactMap { key in
        defaults?.string(forKey: key).map { (key, $0) }
    })
    profileDict = profileDict.merging(customProfileDict) { (current, new) in new }
  }

  if !profileDict.isEmpty {
    CleverTap.sharedInstance()?.profilePush(profileDict)
    CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
  } else {
    print("CTProfile not found: - Not logging Push Impression")
  }
}
#endif
