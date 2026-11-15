"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import type { OperationMap as OperationMapData } from "@vola/shared";
import { useState } from "react";
import branchMarker from "@/assets/markers/branch.png";
import customerMarker from "@/assets/markers/customer.png";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { LiveRefreshToolbar } from "@/components/LiveRefreshToolbar";
import { MapImageMarker } from "@/components/maps/MapImageMarker";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import { findBounds } from "@/lib/map-bounds";
import type { Coordinates } from "@/lib/map-defaults";
import { HIDDEN_PLACES_STYLE } from "@/lib/map-styles";
import { DriverMapMarker } from "./DriverMapMarker";
import { LayerToggles, type OperationLayer } from "./LayerToggles";
import { OperationInfoWindow, type SelectedItem } from "./OperationInfoWindow";

const CITY_ZOOM = 13;
const MINIMUM_POINTS_FOR_BOUNDS = 2;

function findInitialView(operation: OperationMapData, defaultCenter: Coordinates) {
  const points = [...operation.drivers, ...operation.orders, ...operation.branches].map((point) => ({
    lat: point.latitude,
    lng: point.longitude,
  }));
  if (points.length >= MINIMUM_POINTS_FOR_BOUNDS) return { defaultBounds: findBounds(points) };
  // Con un solo punto no hay área que encuadrar: se centra en él, o en la capital si no hay nada.
  const center = points[0] ?? { lat: defaultCenter.latitude, lng: defaultCenter.longitude };
  return { defaultCenter: center, defaultZoom: CITY_ZOOM };
}

interface OperationMapProps {
  operation: OperationMapData;
  layers: OperationLayer[];
  defaultCenter: Coordinates;
  showDriverOwner: boolean;
}

export function OperationMap({ operation, layers, defaultCenter, showDriverOwner }: OperationMapProps) {
  const [visibleLayers, setVisibleLayers] = useState(layers);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isVisible = (layer: OperationLayer) => visibleLayers.includes(layer);
  const counts = {
    drivers: operation.drivers.length,
    orders: operation.orders.length,
    branches: operation.branches.length,
  };

  function toggleLayer(layer: OperationLayer) {
    setVisibleLayers((current) =>
      current.includes(layer) ? current.filter((visible) => visible !== layer) : [...current, layer],
    );
    if (selected?.layer === layer) setSelected(null);
  }

  if (hasAuthFailed) return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  if (!apiKey) return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LayerToggles layers={layers} counts={counts} visibleLayers={visibleLayers} onToggle={toggleLayer} />
        <LiveRefreshToolbar description="El mapa se actualiza solo cada 10 segundos." />
      </div>
      <div className="h-[calc(100dvh-18rem)] min-h-96 overflow-hidden rounded-xl border">
        <APIProvider apiKey={apiKey}>
          <Map
            {...findInitialView(operation, defaultCenter)}
            styles={HIDDEN_PLACES_STYLE}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
          >
            {isVisible("branches") &&
              operation.branches.map((branch) => (
                <MapImageMarker
                  key={branch.id}
                  position={{ lat: branch.latitude, lng: branch.longitude }}
                  image={branchMarker}
                  title={branch.name}
                  onClick={() => setSelected({ layer: "branches", id: branch.id })}
                />
              ))}
            {isVisible("orders") &&
              operation.orders.map((order) => (
                <MapImageMarker
                  key={order.id}
                  position={{ lat: order.latitude, lng: order.longitude }}
                  image={customerMarker}
                  title={`Orden #${order.id}`}
                  onClick={() => setSelected({ layer: "orders", id: order.id })}
                />
              ))}
            {isVisible("drivers") &&
              operation.drivers.map((driver) => (
                <DriverMapMarker
                  key={driver.driverId}
                  driver={driver}
                  onSelect={() => setSelected({ layer: "drivers", id: driver.driverId })}
                />
              ))}
            {selected && (
              <OperationInfoWindow
                operation={operation}
                selected={selected}
                showDriverOwner={showDriverOwner}
                onClose={() => setSelected(null)}
              />
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
