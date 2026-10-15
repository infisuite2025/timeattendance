package com.infitimepro.infi_timepro_mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {
    override fun onStart() {
        super.onStart()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            "infitimepro_alerts",
            "InfiTimePro alerts",
            NotificationManager.IMPORTANCE_HIGH
        )
        channel.description = "Approvals, punches, and attendance alerts"
        val manager = getSystemService(NotificationManager::class.java)
        manager?.createNotificationChannel(channel)
    }
}
