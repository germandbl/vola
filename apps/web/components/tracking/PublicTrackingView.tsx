"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import type { PublicOrderTracking } from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { MAP_AUTH_FAILURE_MESSAGE, useMapAuthFailure } from "@/hooks/use-map-auth-failure";
import { usePublicTracking } from "@/hooks/use-public-tracking";
import { PublicTrackingMap } from "./PublicTrackingMap";
import { TrackingHeader } from "./TrackingHeader";

interface PublicTrackingViewProps {
  trackingCode: string;
  initialTracking: PublicOrderTracking;
}

export function PublicTrackingView({ trackingCode, initialTracking }: PublicTrackingViewProps) {
  const { tracking, hasFailed } = usePublicTracking(trackingCode, initialTracking);
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <main className="relative h-dvh overflow-hidden bg-aire">
      <div className="absolute inset-0">
        {apiKey && !hasAuthFailed && (
          <APIProvider apiKey={apiKey}>
            <PublicTrackingMap tracking={tracking} />
          </APIProvider>
        )}
      </div>
      {/* pointer-events-none: fuera de la tarjeta, el dedo sigue moviendo el mapa. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4">
        <TrackingHeader tracking={tracking} hasFailed={hasFailed} />
        {hasAuthFailed && <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />}
        {!apiKey && <FormErrorAlert message="El mapa no está disponible en este momento." />}
      </div>
    </main>
  );
}
