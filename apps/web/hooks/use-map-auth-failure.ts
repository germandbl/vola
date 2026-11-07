import { useEffect, useState } from "react";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

// Google llama a window.gm_authFailure cuando rechaza la API key; sin esto solo muestra su error en inglés.
export function useMapAuthFailure(): boolean {
  const [hasAuthFailed, setHasAuthFailed] = useState(false);
  useEffect(() => {
    window.gm_authFailure = () => setHasAuthFailed(true);
    return () => {
      delete window.gm_authFailure;
    };
  }, []);
  return hasAuthFailed;
}

export const MAP_AUTH_FAILURE_MESSAGE =
  "Google Maps rechazó la API key. Revisá en Google Cloud que la key tenga las APIs necesarias, facturación activa y este dominio permitido.";

export const MISSING_MAPS_KEY_MESSAGE =
  "Google Maps no está configurado. Agregá NEXT_PUBLIC_GOOGLE_MAPS_API_KEY al panel.";
