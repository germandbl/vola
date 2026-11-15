"use client";

import { Marker } from "@vis.gl/react-google-maps";
import type { StaticImageData } from "next/image";

const MARKER_HEIGHT = 48;

interface MapImageMarkerProps {
  position: google.maps.LatLngLiteral;
  image: StaticImageData;
  title: string;
}

// Va dentro de <Map>: ahí google.maps ya cargó y se puede crear el tamaño del ícono.
export function MapImageMarker({ position, image, title }: MapImageMarkerProps) {
  const width = Math.round((image.width / image.height) * MARKER_HEIGHT);
  return (
    <Marker
      position={position}
      title={title}
      icon={{ url: image.src, scaledSize: new google.maps.Size(width, MARKER_HEIGHT) }}
    />
  );
}
