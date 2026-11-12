import CoreLocation

enum PermissionStatus: String {
  case granted
  case denied
  case undetermined
}

private let HTTP_UNAUTHORIZED = 401
private let HTTP_CONFLICT = 409

final class LocationSharer: NSObject, CLLocationManagerDelegate {
  private lazy var locationManager: CLLocationManager = {
    let manager = CLLocationManager()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
    // Sin filtro de distancia: un motorista detenido también debe seguir reportando cada intervalo.
    manager.distanceFilter = kCLDistanceFilterNone
    manager.activityType = .otherNavigation
    manager.pausesLocationUpdatesAutomatically = false
    return manager
  }()

  private let recordedAtFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  private var options: SharingOptions?
  private var lastSentAt: Date?
  private var pendingPermissionCallbacks: [(PermissionStatus) -> Void] = []
  private(set) var isSharing = false

  func permissionStatus() -> PermissionStatus {
    switch locationManager.authorizationStatus {
    case .authorizedAlways, .authorizedWhenInUse:
      return .granted
    case .notDetermined:
      return .undetermined
    default:
      return .denied
    }
  }

  // Basta "Cuando se usa": con UIBackgroundModes location, las actualizaciones que arrancan en primer plano siguen en segundo plano.
  func requestPermission(onResult: @escaping (PermissionStatus) -> Void) {
    let status = permissionStatus()
    if status != .undetermined {
      onResult(status)
      return
    }
    pendingPermissionCallbacks.append(onResult)
    locationManager.requestWhenInUseAuthorization()
  }

  func start(options: SharingOptions) {
    self.options = options
    lastSentAt = nil
    locationManager.allowsBackgroundLocationUpdates = true
    locationManager.showsBackgroundLocationIndicator = true
    locationManager.startUpdatingLocation()
    isSharing = true
  }

  func stop() {
    locationManager.stopUpdatingLocation()
    locationManager.allowsBackgroundLocationUpdates = false
    options = nil
    isSharing = false
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    let status = permissionStatus()
    if status == .undetermined { return }
    let callbacks = pendingPermissionCallbacks
    pendingPermissionCallbacks = []
    callbacks.forEach { $0(status) }
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let options, let location = locations.last else { return }
    // Una precisión negativa significa que iOS no pudo ubicar al motorista; esa lectura no sirve.
    if location.horizontalAccuracy < 0 { return }
    if let lastSentAt, location.timestamp.timeIntervalSince(lastSentAt) < options.intervalSeconds {
      return
    }
    lastSentAt = location.timestamp
    send(location: location, options: options)
  }

  private func send(location: CLLocation, options: SharingOptions) {
    guard let url = URL(string: "\(options.apiUrl)/drivers/me/location") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(options.token)", forHTTPHeaderField: "Authorization")
    request.httpBody = try? JSONSerialization.data(withJSONObject: [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude,
      "accuracyMeters": location.horizontalAccuracy,
      "recordedAt": recordedAtFormatter.string(from: location.timestamp),
    ])

    // Si falla la red, se descarta esta lectura: solo importa la más reciente y la siguiente llega en un intervalo.
    URLSession.shared.dataTask(with: request) { [weak self] _, response, _ in
      guard let statusCode = (response as? HTTPURLResponse)?.statusCode else { return }
      // Sesión vencida o motorista ya no disponible: seguir enviando solo gastaría batería.
      if statusCode == HTTP_UNAUTHORIZED || statusCode == HTTP_CONFLICT {
        DispatchQueue.main.async { self?.stop() }
      }
    }.resume()
  }
}
