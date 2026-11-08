"use client";

import { Map, useMap, type MapEvent } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import type { SelectedAddress } from "@/hooks/use-address-suggestions";
import type { Coordinates } from "@/lib/map-defaults";

const STREET_ZOOM = 17;
const COORDINATE_DECIMALS = 6;
// Unos 10 cm: por debajo de esto el centro del mapa ya está sobre el punto guardado.
const SAME_LOCATION_TOLERANCE = 1e-6;

function roundCoordinate(value: number): number {
  return Number(value.toFixed(COORDINATE_DECIMALS));
}

function isSameLocation(first: Coordinates, second: Coordinates): boolean {
  const latitudeDifference = Math.abs(first.latitude - second.latitude);
  const longitudeDifference = Math.abs(first.longitude - second.longitude);
  return latitudeDifference < SAME_LOCATION_TOLERANCE && longitudeDifference < SAME_LOCATION_TOLERANCE;
}

function getMapCenter(map: google.maps.Map): Coordinates | null {
  const center = map.getCenter();
  if (!center) return null;
  return { latitude: roundCoordinate(center.lat()), longitude: roundCoordinate(center.lng()) };
}

interface DeliveryLocationMapProps {
  address: SelectedAddress;
  onChange: (address: SelectedAddress) => void;
}

export function DeliveryLocationMap({ address, onChange }: DeliveryLocationMapProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const mapCenter = getMapCenter(map);
    if (mapCenter && isSameLocation(mapCenter, address)) return;
    map.panTo({ lat: address.latitude, lng: address.longitude });
    if ((map.getZoom() ?? 0) < STREET_ZOOM) {
      map.setZoom(STREET_ZOOM);
    }
  }, [map, address]);

  // Mover el mapa solo corrige el punto de entrega; el texto de la dirección sigue siendo el que se buscó.
  function updateLocation(event: MapEvent) {
    const location = getMapCenter(event.map);
    if (!location || isSameLocation(location, address)) return;
    onChange({ ...address, ...location });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-80 overflow-hidden rounded-lg border">
        <Map
          defaultCenter={{ lat: address.latitude, lng: address.longitude }}
          defaultZoom={STREET_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          onIdle={updateLocation}
        />
        {/* El marcador no se mueve: el punto de entrega es el centro del mapa, donde apunta la punta. */}
        <MapPin
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-full fill-blanco text-tinta"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Mové el mapa hasta que el marcador quede sobre la casa del cliente.
      </p>
    </div>
  );
}
