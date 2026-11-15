"use client";

import { APIProvider, InfoWindow, Map } from "@vis.gl/react-google-maps";
import type { DriverMapLocation } from "@vola/shared";
import { useState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import { findBounds } from "@/lib/map-bounds";
import { HIDDEN_PLACES_STYLE } from "@/lib/map-styles";
import type { Coordinates } from "@/lib/map-defaults";
import { DriverInfo } from "./DriverInfo";
import { DriverMapMarker } from "./DriverMapMarker";

const CITY_ZOOM = 13;
// La ventana se abre sobre el pin, que se dibuja hacia arriba del punto.
const INFO_WINDOW_OFFSET: [number, number] = [0, -48];
const MINIMUM_DRIVERS_FOR_BOUNDS = 2;

interface DriversMapProps {
  drivers: DriverMapLocation[];
  defaultCenter: Coordinates;
  showOwner: boolean;
}

export function DriversMap({ drivers, defaultCenter, showOwner }: DriversMapProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const positions = drivers.map((driver) => ({ lat: driver.latitude, lng: driver.longitude }));
  // Si el motorista seleccionado dejó de trabajar, su ventana se cierra en la siguiente actualización.
  const selectedDriver = drivers.find((driver) => driver.driverId === selectedDriverId);
  // Con un solo motorista no hay área que encuadrar: se centra en él a nivel de ciudad.
  const center =
    positions.length === 1 ? positions[0] : { lat: defaultCenter.latitude, lng: defaultCenter.longitude };

  if (hasAuthFailed) return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  if (!apiKey) return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;

  return (
    <div className="relative h-[calc(100dvh-16rem)] min-h-96 overflow-hidden rounded-xl border">
      <APIProvider apiKey={apiKey}>
        <Map
          {...(positions.length >= MINIMUM_DRIVERS_FOR_BOUNDS
            ? { defaultBounds: findBounds(positions) }
            : { defaultCenter: center, defaultZoom: CITY_ZOOM })}
          styles={HIDDEN_PLACES_STYLE}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
        >
          {drivers.map((driver) => (
            <DriverMapMarker key={driver.driverId} driver={driver} onSelect={setSelectedDriverId} />
          ))}
          {selectedDriver && (
            <InfoWindow
              position={{ lat: selectedDriver.latitude, lng: selectedDriver.longitude }}
              pixelOffset={INFO_WINDOW_OFFSET}
              headerContent={<p className="font-semibold text-tinta">{selectedDriver.name}</p>}
              onCloseClick={() => setSelectedDriverId(null)}
            >
              <DriverInfo driver={selectedDriver} showOwner={showOwner} />
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
      {drivers.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="rounded-xl border border-linea bg-blanco px-4 py-3 text-sm shadow-flotante">
            Ningún motorista está trabajando ahora. Van a aparecer acá cuando se marquen disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
