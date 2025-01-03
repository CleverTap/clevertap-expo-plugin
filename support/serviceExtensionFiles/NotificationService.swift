import UserNotifications

class NotificationService: UNNotificationServiceExtension {
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    super.didReceive(request, withContentHandler: contentHandler)
  }
}
