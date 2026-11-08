"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";

const MAP_ZOOM = 15;

interface OrderDetailMapProps {
  latitude: number;
  longitude: number;
}

// El mapa arranca cerrado: cada vez que se abre cuesta una carga de Google Maps.
export function OrderDetailMap({ latitude, longitude }: OrderDetailMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: latitude, lng: longitude };

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 py-2 text-sm text-muted-foreground hover:bg-muted"
      >
        <span>Mapa de entrega</span>
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {isOpen && (
        <div className="h-56">
          {hasAuthFailed && <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />}
          {!apiKey && <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />}
          {apiKey && !hasAuthFailed && (
            <APIProvider apiKey={apiKey}>
              <Map defaultCenter={position} defaultZoom={MAP_ZOOM} disableDefaultUI zoomControl>
                <Marker position={position} />
              </Map>
            </APIProvider>
          )}
        </div>
      )}
    </div>
  );
}
