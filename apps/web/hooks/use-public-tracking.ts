import { ACTIVE_ORDER_STATUSES, type PublicOrderTracking } from "@vola/shared";
import { useEffect, useState } from "react";
import { loadPublicTracking } from "@/lib/tracking-actions";

// Igual al intervalo con que la app de motoristas envía su ubicación: consultar más seguido no trae datos nuevos.
const POLL_INTERVAL_MS = 10_000;

interface PublicTrackingState {
  tracking: PublicOrderTracking;
  hasFailed: boolean;
}

export function usePublicTracking(trackingCode: string, initialTracking: PublicOrderTracking) {
  const [state, setState] = useState<PublicTrackingState>({
    tracking: initialTracking,
    hasFailed: false,
  });
  // Entregada o cancelada ya no cambia: no hace falta seguir consultando.
  const isOrderActive = ACTIVE_ORDER_STATUSES.includes(state.tracking.status);

  useEffect(() => {
    if (!isOrderActive) return;
    let isStopped = false;

    // Con la pestaña oculta nadie mira el mapa: no se consulta y se retoma al volver.
    async function refreshTracking() {
      if (document.visibilityState === "hidden") return;
      try {
        const tracking = await loadPublicTracking(trackingCode);
        if (isStopped || !tracking) return;
        setState({ tracking, hasFailed: false });
      } catch (error) {
        if (isStopped) return;
        // Se muestra el aviso con la última ubicación conocida y la siguiente consulta lo vuelve a intentar.
        setState((current) => ({ ...current, hasFailed: true }));
        console.error(error);
      }
    }

    const intervalId = setInterval(refreshTracking, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshTracking);
    return () => {
      isStopped = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshTracking);
    };
  }, [trackingCode, isOrderActive]);

  return state;
}
