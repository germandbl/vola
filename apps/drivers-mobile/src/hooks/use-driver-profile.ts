import type { DriverProfile } from "@vola/shared";
import { useEffect, useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { requestDriverProfile, requestUpdateAvailability } from "@/lib/driver-api";
import {
  hasLocationPermission,
  requestLocationPermission,
  startLocationSharing,
  stopLocationSharing,
} from "@/lib/location-sharing";
import { useSignedInSession } from "@/session/SessionProvider";

const UNREACHABLE_MESSAGE = "No hay conexión con Volá!. Revisá tu internet y probá de nuevo.";
const UNEXPECTED_MESSAGE = "Algo falló de nuestro lado. Probá de nuevo en un momento.";

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiUnreachableError) return UNREACHABLE_MESSAGE;
  return UNEXPECTED_MESSAGE;
}

export function useDriverProfile() {
  const { token } = useSignedInSession();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [error, setError] = useState<string>();
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isLocationPermissionMissing, setIsLocationPermissionMissing] = useState(false);

  useEffect(() => {
    // Si el sistema cerró la app o se reinició el teléfono, el envío de ubicación se cortó: se retoma al abrir.
    async function resumeLocationSharing() {
      if (!(await hasLocationPermission())) {
        setIsLocationPermissionMissing(true);
        return;
      }
      await startLocationSharing(token);
    }

    async function loadProfile() {
      try {
        const loadedProfile = await requestDriverProfile(token);
        setProfile(loadedProfile);
        if (loadedProfile.isAvailable) await resumeLocationSharing();
      } catch (loadError) {
        setError(toErrorMessage(loadError));
        if (!(loadError instanceof ApiUnreachableError)) throw loadError;
      }
    }
    loadProfile();
  }, [token]);

  async function becomeAvailable() {
    const isPermissionGranted = await requestLocationPermission();
    setIsLocationPermissionMissing(!isPermissionGranted);
    if (!isPermissionGranted) return;

    setProfile(await requestUpdateAvailability(token, true));
    await startLocationSharing(token);
  }

  async function becomeUnavailable() {
    await stopLocationSharing();
    setIsLocationPermissionMissing(false);
    setProfile(await requestUpdateAvailability(token, false));
  }

  async function changeAvailability(isAvailable: boolean) {
    setError(undefined);
    setIsUpdatingAvailability(true);
    try {
      if (isAvailable) {
        await becomeAvailable();
      } else {
        await becomeUnavailable();
      }
    } catch (updateError) {
      setError(toErrorMessage(updateError));
      if (!(updateError instanceof ApiUnreachableError)) throw updateError;
    } finally {
      setIsUpdatingAvailability(false);
    }
  }

  return {
    profile,
    error,
    isUpdatingAvailability,
    isLocationPermissionMissing,
    changeAvailability,
  };
}
