import CTNotificationService
import CleverTapSDK

class NotificationService: CTNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    // let profile: Dictionary<String, AnyObject> = [
    //   "Name": "testUserA1" as AnyObject,
    //   "Identity": 123456 as AnyObject,
    //   "Email": "test@test.com" as AnyObject ]
    // CleverTap.sharedInstance()?.profilePush(profile)
    // CleverTap.sharedInstance()?.recordNotificationViewedEvent(withData: request.content.userInfo)
    super.didReceive(request, withContentHandler: contentHandler)
  }
}