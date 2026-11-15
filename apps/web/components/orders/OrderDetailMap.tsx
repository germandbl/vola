"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import type { OrderDetail } from "@vola/shared";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import branchMarker from "@/assets/markers/branch.png";
import customerMarker from "@/assets/markers/customer.png";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { MapImageMarker } from "@/components/maps/MapImageMarker";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import { findBounds } from "@/lib/map-bounds";

interface OrderDetailMapProps {
  order: OrderDetail;
}

// El mapa arranca cerrado: cada vez que se abre cuesta una carga de Google Maps.
export function OrderDetailMap({ order }: OrderDetailMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const branchPosition = { lat: order.branchLatitude, lng: order.branchLongitude };
  const customerPosition = { lat: order.deliveryLatitude, lng: order.deliveryLongitude };

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
              {/* key: al pasar a otra orden, el mapa se arma de nuevo con el encuadre de esa orden. */}
              <Map
                key={order.id}
                defaultBounds={findBounds([branchPosition, customerPosition])}
                disableDefaultUI
                zoomControl
              >
                <MapImageMarker position={branchPosition} image={branchMarker} title="Sucursal" />
                <MapImageMarker position={customerPosition} image={customerMarker} title="Cliente" />
              </Map>
            </APIProvider>
          )}
        </div>
      )}
    </div>
  );
}
