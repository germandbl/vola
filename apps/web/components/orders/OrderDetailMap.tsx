"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import customerMarker from "@/assets/markers/customer.png";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";

const MAP_ZOOM = 15;
const MARKER_HEIGHT = 48;
const MARKER_WIDTH = Math.round((customerMarker.width / customerMarker.height) * MARKER_HEIGHT);

interface CustomerMarkerProps {
  position: google.maps.LatLngLiteral;
}

// Va en su propio componente: así se renderiza dentro de <Map>, cuando google.maps ya cargó.
function CustomerMarker({ position }: CustomerMarkerProps) {
  return (
    <Marker
      position={position}
      title="Cliente"
      icon={{
        url: customerMarker.src,
        scaledSize: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
      }}
    />
  );
}

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
                <CustomerMarker position={position} />
              </Map>
            </APIProvider>
          )}
        </div>
      )}
    </div>
  );
}
