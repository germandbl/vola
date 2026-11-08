import type { DriverProfile } from "@vola/shared";
import { useEffect, useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { requestDriverProfile, requestUpdateAvailability } from "@/lib/driver-api";
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

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await requestDriverProfile(token));
      } catch (loadError) {
        setError(toErrorMessage(loadError));
        if (!(loadError instanceof ApiUnreachableError)) throw loadError;
      }
    }
    loadProfile();
  }, [token]);

  async function changeAvailability(isAvailable: boolean) {
    setError(undefined);
    setIsUpdatingAvailability(true);
    try {
      setProfile(await requestUpdateAvailability(token, isAvailable));
    } catch (updateError) {
      setError(toErrorMessage(updateError));
      if (!(updateError instanceof ApiUnreachableError)) throw updateError;
    } finally {
      setIsUpdatingAvailability(false);
    }
  }

  return { profile, error, isUpdatingAvailability, changeAvailability };
}
