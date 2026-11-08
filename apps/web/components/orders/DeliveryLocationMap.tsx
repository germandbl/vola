"use client";

import { Map, useMap, type MapEvent } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import type { Coordinates } from "@/lib/map-defaults";

const CITY_ZOOM = 13;
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
  location: Coordinates | null;
  defaultCenter: Coordinates;
  onChange: (location: Coordinates) => void;
}

export function DeliveryLocationMap({ location, defaultCenter, onChange }: DeliveryLocationMapProps) {
  const map = useMap();
  const target = location ?? defaultCenter;

  useEffect(() => {
    if (!map) return;
    const mapCenter = getMapCenter(map);
    if (mapCenter && isSameLocation(mapCenter, target)) return;
    map.panTo({ lat: target.latitude, lng: target.longitude });
    if (location && (map.getZoom() ?? 0) < STREET_ZOOM) {
      map.setZoom(STREET_ZOOM);
    }
  }, [map, location, target]);

  // Mientras no se mueva el mapa no hay punto de entrega: el centro inicial es solo la capital del país.
  function updateLocation(event: MapEvent) {
    const mapCenter = getMapCenter(event.map);
    if (!mapCenter || isSameLocation(mapCenter, target)) return;
    onChange(mapCenter);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-80 overflow-hidden rounded-lg border">
        <Map
          defaultCenter={{ lat: target.latitude, lng: target.longitude }}
          defaultZoom={location ? STREET_ZOOM : CITY_ZOOM}
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
        Buscá la dirección o mové el mapa hasta que el marcador quede sobre la casa del cliente.
      </p>
    </div>
  );
}
