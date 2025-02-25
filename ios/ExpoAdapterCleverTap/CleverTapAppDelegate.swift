import ExpoModulesCore
import class CleverTapSDK.CleverTap
import class CleverTapReact.CleverTapReactManager
import SystemConfiguration

public class CleverTapAppDelegate: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    CleverTap.autoIntegrate() 
    let plistDict = Bundle.main.infoDictionary


  	CleverTapReactManager.sharedInstance()?.applicationDidLaunch(options: launchOptions)
    return true
  }
}