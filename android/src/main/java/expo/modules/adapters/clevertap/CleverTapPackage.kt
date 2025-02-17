package expo.modules.adapters.clevertap

import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class CleverTapPackage : Package {
    override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
        return listOf(CleverTapReactApplicationLifecycleListener())
    }
    override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
        return listOf(CleverTapReactActivityLifecycleListener(activityContext))
    }
}