package expo.modules.adapters.clevertap

import android.app.Application
import android.content.Context
import android.util.Log
import com.clevertap.android.pushtemplates.PushTemplateNotificationHandler
import com.clevertap.android.sdk.ActivityLifecycleCallback
import com.clevertap.android.sdk.CleverTapAPI
import com.clevertap.android.sdk.Logger
import com.clevertap.android.sdk.interfaces.NotificationHandler
import com.clevertap.react.CleverTapRnAPI
import expo.modules.core.interfaces.ApplicationLifecycleListener

class CleverTapReactApplicationLifecycleListener : ApplicationLifecycleListener {

    override fun onCreate(application: Application) {

        val registerActivityLifecycle = getBooleanValue(
            application,
            R.string.expo_clevertap_register_activity_lifecycle_callbacks
        )
        val logLevel = getIntegerValue(
            application,
            R.string.expo_clevertap_log_level
        )
        val enablePushTemplates = getBooleanValue(
            application,
            R.string.expo_clevertap_enable_push_templates
        )

        CleverTapAPI.setDebugLevel(logLevel)
        Log.i("Hurray","inside package")
        if (registerActivityLifecycle) {
            ActivityLifecycleCallback.register(application)
        }

        super.onCreate(application)
        CleverTapRnAPI.initReactNativeIntegration(application)

        if (enablePushTemplates) {
            try {
                CleverTapAPI.setNotificationHandler(PushTemplateNotificationHandler() as NotificationHandler)
            } catch (t: Throwable) {
                Logger.v("Unable to set push templates notification handler",t.message)
            }
        }

    }

    fun getBooleanValue(context: Context, key: Int): Boolean = context.getString(key).toBoolean()
    fun getIntegerValue(context: Context, key: Int): Int = context.getString(key).toInt()
}