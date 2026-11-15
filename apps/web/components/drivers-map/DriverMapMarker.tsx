"use client";

import type { DriverMapLocation } from "@vola/shared";
import driverMarker from "@/assets/markers/driver.png";
import { MapImageMarker } from "@/components/maps/MapImageMarker";
import { useAnimatedPosition } from "@/hooks/use-animated-position";

interface DriverMapMarkerProps {
  driver: DriverMapLocation;
  onSelect: (driverId: number) => void;
}

// Con cada actualización el pin se desliza hacia la nueva ubicación en vez de saltar.
export function DriverMapMarker({ driver, onSelect }: DriverMapMarkerProps) {
  const position = useAnimatedPosition({ lat: driver.latitude, lng: driver.longitude });
  return (
    <MapImageMarker
      position={position}
      image={driverMarker}
      title={driver.name}
      onClick={() => onSelect(driver.driverId)}
    />
  );
}
