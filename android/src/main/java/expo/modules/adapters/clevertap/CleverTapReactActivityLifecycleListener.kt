package expo.modules.adapters.clevertap

import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.Intent.getIntent
import android.os.Build
import android.os.Bundle
import com.clevertap.android.sdk.CleverTapAPI
import com.clevertap.android.sdk.Logger
import com.clevertap.react.CleverTapRnAPI
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class CleverTapReactActivityLifecycleListener(private val activityContext: Context) : ReactActivityLifecycleListener {


    override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
        super.onCreate(activity, savedInstanceState)
        activity.intent?.data?.also {
            CleverTapRnAPI.setInitialUri(it)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            NotificationUtils.dismissNotification(activity.intent, activity.applicationContext)
        }
    }
    override fun onResume(activity: Activity) {
        super.onResume(activity)

        val payload = activity.intent?.extras
        if (payload?.containsKey("pt_id") == true && payload["pt_id"] == "pt_rating") {
            val nm = activity.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(payload["notificationId"] as Int)
        }
        if (payload?.containsKey("pt_id") == true && payload["pt_id"] == "pt_product_display") {
            val nm = activity.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(payload["notificationId"] as Int)
        }
    }

    override fun onNewIntent(intent: Intent): Boolean {
        val result = super.onNewIntent(intent)
        intent.data?.also {
            CleverTapRnAPI.setInitialUri(it)
        }

        val cleverTapDefaultInstance = CleverTapAPI.getDefaultInstance(activityContext.applicationContext)

        val payload = intent.extras
        if (payload?.containsKey("pt_id") == true && payload["pt_id"] == "pt_rating") {
            val nm = activityContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(payload["notificationId"] as Int)
        }
        if (payload?.containsKey("pt_id") == true && payload["pt_id"] == "pt_product_display") {
            val nm = activityContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(payload["notificationId"] as Int)
        }

        /**
         * On Android 12, Raise notification clicked event when Activity is already running in activity backstack
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            cleverTapDefaultInstance?.pushNotificationClickedEvent(intent.extras)
        }

        /**
         * On Android 12, clear notification on CTA click when Activity is already running in activity backstack
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            NotificationUtils.dismissNotification(intent, activityContext.applicationContext)
        }
        return result
    }
}