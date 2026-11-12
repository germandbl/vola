import ExpoModulesCore

struct SharingOptions: Record {
  @Field var apiUrl: String = ""
  @Field var token: String = ""
  @Field var intervalSeconds: Double = 30
}

final class LocationPermissionDeniedException: Exception {
  override var reason: String {
    "Location permission is not granted; request it before sharing the location"
  }
}

public class VolaLocationModule: Module {
  private let locationSharer = LocationSharer()

  public func definition() -> ModuleDefinition {
    Name("VolaLocation")

    // CLLocationManager se usa siempre desde el hilo principal: es donde entrega las ubicaciones y los cambios de permiso.
    AsyncFunction("getPermissionStatusAsync") { () -> String in
      return self.locationSharer.permissionStatus().rawValue
    }.runOnQueue(.main)

    AsyncFunction("requestPermissionAsync") { (promise: Promise) in
      self.locationSharer.requestPermission { status in
        promise.resolve(status.rawValue)
      }
    }.runOnQueue(.main)

    AsyncFunction("startSharingAsync") { (options: SharingOptions) in
      if self.locationSharer.permissionStatus() != .granted {
        throw LocationPermissionDeniedException()
      }
      self.locationSharer.start(options: options)
    }.runOnQueue(.main)

    AsyncFunction("stopSharingAsync") {
      self.locationSharer.stop()
    }.runOnQueue(.main)

    Function("isSharing") {
      return self.locationSharer.isSharing
    }
  }
}
