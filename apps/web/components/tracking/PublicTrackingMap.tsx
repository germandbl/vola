"use client";

import { Map } from "@vis.gl/react-google-maps";
import type { PublicOrderTracking } from "@vola/shared";
import branchMarker from "@/assets/markers/branch.png";
import customerMarker from "@/assets/markers/customer.png";
import { MapImageMarker } from "@/components/maps/MapImageMarker";
import { findBounds } from "@/lib/map-bounds";
import { DriverMarker } from "./DriverMarker";

// Arriba queda la tarjeta flotante: el encuadre deja ese espacio libre para que no tape los pines.
const MAP_PADDING: google.maps.Padding = { top: 260, right: 48, bottom: 48, left: 48 };

// Sin negocios ni paradas de bus: en el mapa solo deben destacar la sucursal, el cliente y el motorista.
const HIDDEN_PLACES_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

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
