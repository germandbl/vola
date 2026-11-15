"use client";

import { Map } from "@vis.gl/react-google-maps";
import type { PublicOrderTracking } from "@vola/shared";
import branchMarker from "@/assets/markers/branch.png";
import customerMarker from "@/assets/markers/customer.png";
import { MapImageMarker } from "@/components/maps/MapImageMarker";
import { findBounds } from "@/lib/map-bounds";
import { HIDDEN_PLACES_STYLE } from "@/lib/map-styles";
import { DriverMarker } from "./DriverMarker";

// Arriba queda la tarjeta flotante: el encuadre deja ese espacio libre para que no tape los pines.
const MAP_PADDING: google.maps.Padding = { top: 260, right: 48, bottom: 48, left: 48 };

interface PublicTrackingMapProps {
  tracking: PublicOrderTracking;
}

export function PublicTrackingMap({ tracking }: PublicTrackingMapProps) {
  const branchPosition = { lat: tracking.branchLatitude, lng: tracking.branchLongitude };
  const customerPosition = { lat: tracking.deliveryLatitude, lng: tracking.deliveryLongitude };

  return (
    <Map
      defaultBounds={findBounds([branchPosition, customerPosition], MAP_PADDING)}
      styles={HIDDEN_PLACES_STYLE}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl
    >
      <MapImageMarker position={branchPosition} image={branchMarker} title="Sucursal" />
      <MapImageMarker position={customerPosition} image={customerMarker} title="Tu dirección" />
      {tracking.driverLocation && (
        <DriverMarker location={tracking.driverLocation} framePadding={MAP_PADDING} />
      )}
    </Map>
  );
}
