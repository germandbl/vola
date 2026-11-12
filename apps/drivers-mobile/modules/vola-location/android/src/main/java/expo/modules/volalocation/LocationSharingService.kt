package expo.modules.volalocation

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import org.json.JSONObject

private const val EXTRA_API_URL = "apiUrl"
private const val EXTRA_TOKEN = "token"
private const val EXTRA_INTERVAL_SECONDS = "intervalSeconds"
private const val NOTIFICATION_CHANNEL_ID = "vola_location_sharing"
private const val NOTIFICATION_ID = 1501
private const val MILLISECONDS_PER_SECOND = 1000L
private const val REQUEST_TIMEOUT_MILLISECONDS = 15_000
private const val HTTP_UNAUTHORIZED = 401
private const val HTTP_CONFLICT = 409

class LocationSharingService : Service() {
  private lateinit var locationClient: FusedLocationProviderClient
  private val requestExecutor: ExecutorService = Executors.newSingleThreadExecutor()
  private val mainHandler = Handler(Looper.getMainLooper())
  private var apiUrl = ""
  private var token = ""

  private val recordedAtFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
  }

  private val locationCallback = object : LocationCallback() {
    override fun onLocationResult(result: LocationResult) {
      val location = result.lastLocation ?: return
      sendLocation(location)
    }
  }

  override fun onCreate() {
    super.onCreate()
    locationClient = LocationServices.getFusedLocationProviderClient(this)
  }

  override fun onBind(intent: Intent?): IBinder? = null

  // START_NOT_STICKY: si Android mata el proceso, la app vuelve a arrancar el servicio al abrirse.
  // Reiniciarlo solo desde segundo plano no está permitido para servicios de ubicación con permiso de uso.
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent == null || !hasLocationPermission(this)) {
      stopSelf()
      return START_NOT_STICKY
    }
    apiUrl = intent.getStringExtra(EXTRA_API_URL) ?: ""
    token = intent.getStringExtra(EXTRA_TOKEN) ?: ""
    val intervalSeconds = intent.getDoubleExtra(EXTRA_INTERVAL_SECONDS, 0.0)

    startInForeground()
    startLocationUpdates((intervalSeconds * MILLISECONDS_PER_SECOND).toLong())
    isRunning = true
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    locationClient.removeLocationUpdates(locationCallback)
    requestExecutor.shutdown()
    isRunning = false
    super.onDestroy()
  }

  private fun startInForeground() {
    val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, buildNotification(), serviceType)
  }

  private fun buildNotification(): Notification {
    // Los canales existen desde Android 8; antes la notificación no los necesita.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager.createNotificationChannel(
        NotificationChannel(
          NOTIFICATION_CHANNEL_ID,
          "Ubicación compartida",
          NotificationManager.IMPORTANCE_LOW,
        ),
      )
    }
    val openAppIntent = packageManager.getLaunchIntentForPackage(packageName)
    val openApp = PendingIntent.getActivity(this, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE)
    return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
      .setSmallIcon(R.drawable.vola_location_notification)
      .setContentTitle("Estás disponible")
      .setContentText("Volá! está compartiendo tu ubicación.")
      .setContentIntent(openApp)
      .setOngoing(true)
      .build()
  }

  // El permiso se revisa en onStartCommand antes de llegar acá.
  @SuppressLint("MissingPermission")
  private fun startLocationUpdates(intervalMilliseconds: Long) {
    locationClient.removeLocationUpdates(locationCallback)
    val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, intervalMilliseconds)
      .setMinUpdateIntervalMillis(intervalMilliseconds)
      .build()
    locationClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
  }

  private fun sendLocation(location: Location) {
    val body = JSONObject()
      .put("latitude", location.latitude)
      .put("longitude", location.longitude)
      .put("accuracyMeters", location.accuracy.toDouble())
      .put("recordedAt", recordedAtFormat.format(Date(location.time)))
      .toString()

    requestExecutor.execute {
      val statusCode = putLocation(body) ?: return@execute
      // Sesión vencida o motorista ya no disponible: seguir enviando solo gastaría batería.
      if (statusCode == HTTP_UNAUTHORIZED || statusCode == HTTP_CONFLICT) {
        mainHandler.post { stopSelf() }
      }
    }
  }

  private fun putLocation(body: String): Int? {
    val connection = URL("$apiUrl/drivers/me/location").openConnection() as HttpURLConnection
    try {
      connection.requestMethod = "PUT"
      connection.connectTimeout = REQUEST_TIMEOUT_MILLISECONDS
      connection.readTimeout = REQUEST_TIMEOUT_MILLISECONDS
      connection.doOutput = true
      connection.setRequestProperty("Content-Type", "application/json")
      connection.setRequestProperty("Authorization", "Bearer $token")
      connection.outputStream.use { it.write(body.toByteArray()) }
      return connection.responseCode
    } catch (networkError: IOException) {
      // Sin red se descarta esta lectura: solo importa la más reciente y la siguiente llega en un intervalo.
      return null
    } finally {
      connection.disconnect()
    }
  }

  companion object {
    @Volatile
    var isRunning = false
      private set

    fun start(context: Context, options: SharingOptions) {
      val intent = Intent(context, LocationSharingService::class.java)
        .putExtra(EXTRA_API_URL, options.apiUrl)
        .putExtra(EXTRA_TOKEN, options.token)
        .putExtra(EXTRA_INTERVAL_SECONDS, options.intervalSeconds)
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, LocationSharingService::class.java))
    }
  }
}
