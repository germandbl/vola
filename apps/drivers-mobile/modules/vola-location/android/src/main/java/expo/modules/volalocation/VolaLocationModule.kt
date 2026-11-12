package expo.modules.volalocation

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.interfaces.permissions.PermissionsResponseListener
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val PERMISSION_GRANTED = "granted"
private const val PERMISSION_DENIED = "denied"

class LocationPermissionDeniedException :
  CodedException("Location permission is not granted; request it before sharing the location")

class VolaLocationModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("VolaLocation")

    AsyncFunction("getPermissionStatusAsync") {
      readPermissionStatus()
    }

    AsyncFunction("requestPermissionAsync") { promise: Promise ->
      val permissions = appContext.permissions ?: throw Exceptions.PermissionsModuleNotFound()
      permissions.askForPermissions(
        PermissionsResponseListener { promise.resolve(readPermissionStatus()) },
        *findRequestedPermissions(),
      )
    }

    AsyncFunction("startSharingAsync") { options: SharingOptions ->
      if (readPermissionStatus() != PERMISSION_GRANTED) throw LocationPermissionDeniedException()
      LocationSharingService.start(context, options)
    }

    AsyncFunction("stopSharingAsync") {
      LocationSharingService.stop(context)
    }

    Function("isSharing") {
      LocationSharingService.isRunning
    }
  }

  // Android no distingue "nunca preguntado" de "negado": sin permiso siempre es denied y la app vuelve a pedirlo.
  private fun readPermissionStatus(): String {
    if (hasLocationPermission(context)) return PERMISSION_GRANTED
    return PERMISSION_DENIED
  }

  // Basta el permiso de uso: un servicio en primer plano de tipo location sigue recibiendo ubicaciones en segundo plano.
  // El de notificaciones es para que se vea el aviso del servicio; si lo niega, la ubicación igual se comparte.
  private fun findRequestedPermissions(): Array<String> {
    val locationPermissions = arrayOf(
      Manifest.permission.ACCESS_FINE_LOCATION,
      Manifest.permission.ACCESS_COARSE_LOCATION,
    )
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return locationPermissions
    return locationPermissions + Manifest.permission.POST_NOTIFICATIONS
  }
}

fun hasLocationPermission(context: Context): Boolean {
  val fineLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
  val coarseLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
  return fineLocation == PackageManager.PERMISSION_GRANTED || coarseLocation == PackageManager.PERMISSION_GRANTED
}
