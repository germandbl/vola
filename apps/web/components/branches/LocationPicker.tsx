"use client";

import { APIProvider, Map, type MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import type { Coordinates } from "@/lib/map-defaults";

const DEFAULT_ZOOM = 16;
const COORDINATE_DECIMALS = 6;

function roundCoordinate(value: number): number {
  return Number(value.toFixed(COORDINATE_DECIMALS));
}

interface LocationPickerProps {
  initialLocation: Coordinates;
  location: Coordinates;
  onChange: (location: Coordinates) => void;
}

export function LocationPicker({ initialLocation, location, onChange }: LocationPickerProps) {
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (hasAuthFailed) {
    return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  }
  if (!apiKey) {
    return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;
  }

  function updateLocation(event: MapCameraChangedEvent) {
    onChange({
      latitude: roundCoordinate(event.detail.center.lat),
      longitude: roundCoordinate(event.detail.center.lng),
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <APIProvider apiKey={apiKey}>
        <div className="relative h-80 overflow-hidden rounded-lg border lg:h-96">
          <Map
            defaultCenter={{ lat: initialLocation.latitude, lng: initialLocation.longitude }}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            onCameraChanged={updateLocation}
          />
          {/* El marcador no se mueve: el punto de la ubicación es el centro del mapa, donde apunta la punta. */}
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-full fill-blanco text-tinta"
          />
        </div>
      </APIProvider>
      <p className="text-sm text-muted-foreground">
        Mové el mapa hasta que el marcador quede sobre la sucursal. Latitud {location.latitude},
        longitud {location.longitude}.
      </p>
    </div>
  );
}
