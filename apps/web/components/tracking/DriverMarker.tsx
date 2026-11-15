"use client";

import { useMap } from "@vis.gl/react-google-maps";
import type { OrderDriverLocation } from "@vola/shared";
import { useEffect, useRef } from "react";
import driverMarker from "@/assets/markers/driver.png";
import { useAnimatedPosition } from "@/hooks/use-animated-position";
import { MapImageMarker } from "@/components/maps/MapImageMarker";

interface DriverMarkerProps {
  location: OrderDriverLocation;
  framePadding: google.maps.Padding;
}

export function DriverMarker({ location, framePadding }: DriverMarkerProps) {
  const map = useMap();
  const position = useAnimatedPosition({ lat: location.latitude, lng: location.longitude });
  const hasFramedDriver = useRef(false);

  // El mapa arranca encuadrando sucursal y cliente; si el motorista está lejos de ambos, se amplía una vez para verlo.
  useEffect(() => {
    if (!map || hasFramedDriver.current) return;
    // Sin bounds el mapa todavía no terminó de dibujarse; se reintenta con la siguiente ubicación.
    const bounds = map.getBounds();
    if (!bounds) return;
    hasFramedDriver.current = true;
    const driverPosition = { lat: location.latitude, lng: location.longitude };
    if (bounds.contains(driverPosition)) return;
    map.fitBounds(bounds.extend(driverPosition), framePadding);
  }, [map, location.latitude, location.longitude, framePadding]);

  return <MapImageMarker position={position} image={driverMarker} title="Motorista" />;
}
