package com.tok.coride

import android.content.Context
import android.media.AudioManager
import android.media.RingtoneManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** Plays a short alert tone and vibrates: a soft ping for chat, a double chime for an accepted ride. */
class NotifyModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

  override fun getName(): String = "Notify"

  @ReactMethod
  fun play(kind: String) {
    try {
      if (kind == "accepted") {
        val tg = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 90)
        tg.startTone(ToneGenerator.TONE_PROP_ACK, 600)
        buzz(longArrayOf(0, 120, 80, 120))
      } else {
        val r = RingtoneManager.getRingtone(ctx, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
        r?.play()
        buzz(longArrayOf(0, 60))
      }
    } catch (e: Exception) {
      // sound is a nicety; never crash the app for it
    }
  }

  private fun buzz(pattern: LongArray) {
    val v = ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
    if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(pattern, -1))
    else @Suppress("DEPRECATION") v.vibrate(pattern, -1)
  }
}
