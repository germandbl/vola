import type { DriverPendingCash } from "@vola/shared";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { requestPendingCash } from "@/lib/settlement-api";
import { useSignedInSession } from "@/session/SessionProvider";

// Se recarga cada vez que el motorista abre Mi cuenta: entre visita y visita pudo entregar órdenes o liquidar.
export function usePendingCash() {
  const { token } = useSignedInSession();
  const [pendingCash, setPendingCash] = useState<DriverPendingCash | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadPendingCash() {
        try {
          setPendingCash(await requestPendingCash(token));
        } catch (loadError) {
          // Sin conexión se queda el último monto: Mi cuenta ya muestra el aviso de que no hay conexión.
          if (!(loadError instanceof ApiUnreachableError)) throw loadError;
        }
      }
      loadPendingCash();
    }, [token]),
  );

  return pendingCash;
}
