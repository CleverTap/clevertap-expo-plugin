import UserNotifications

class NotificationService: UNNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    super.didReceive(request, withContentHandler: contentHandler)
  }
}

func getUserDefaults(_ request: UNNotificationRequest) {
  guard let ctExpo = Bundle.main.object(forInfoDictionaryKey: "CTExpo") as? [String: String],
        let appGroup = ctExpo["AppGroup"] else {
    //logs
    print("CTExpo and AppGroup key not found: - Not logging Push Impression")
    return
  }
  
  let defaults = UserDefaults(suiteName: appGroup)
  
  guard let accountID = defaults?.string(forKey: "accountID"),
        let token = defaults?.string(forKey: "token") else {
    //logs
    print("accountID and token key not found: - Not logging Push Impression")
    return
  }
  
  
  if let handshakeDomain = defaults?.string(forKey: "handshakeDomain"),
     let proxyDomain = defaults?.string(forKey: "proxyDomain"),
     let spikyProxyDomain = defaults?.string(forKey: "spikyProxyDomain") {
    CleverTap.setCredentialsWithAccountID(accountID, token: token, proxyDomain: proxyDomain, spikyProxyDomain: spikyProxyDomain, handshakeDomain: handshakeDomain)
  }
  
  else if let proxyDomain = defaults?.string(forKey: "proxyDomain"),
          let spikyProxyDomain = defaults?.string(forKey: "spikyProxyDomain") {
    CleverTap.setCredentialsWithAccountID(accountID, token: token, proxyDomain: proxyDomain, spikyProxyDomain: spikyProxyDomain)
  }
  
  else if let region = defaults?.string(forKey: "region") {
    CleverTap.setCredentialsWithAccountID(accountID, token: token, region: region)
  }
  
  else {
    CleverTap.setCredentialsWithAccountID(accountID, andToken: token)
  }
  
  if let profile = defaults?.object(forKey: "CTProfile") as? [AnyHashable : Any] {
    CleverTap.sharedInstance()?.profilePush(profile)
    CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
  } else {
    print("CTProfile key not found: - Not logging Push Impression")
  }
}
