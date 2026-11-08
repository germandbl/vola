import type { DriverOrder } from "@vola/shared";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { requestAssignedOrders } from "@/lib/order-api";
import { useSignedInSession } from "@/session/SessionProvider";

const UNREACHABLE_MESSAGE = "No hay conexión con Volá!. Deslizá hacia abajo para probar de nuevo.";
const UNEXPECTED_MESSAGE = "No pudimos cargar tus órdenes. Deslizá hacia abajo para probar de nuevo.";

export function useAssignedOrders() {
  const { token } = useSignedInSession();
  const [orders, setOrders] = useState<DriverOrder[] | null>(null);
  const [error, setError] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await requestAssignedOrders(token));
      setError(undefined);
    } catch (loadError) {
      if (loadError instanceof ApiUnreachableError) {
        setError(UNREACHABLE_MESSAGE);
        return;
      }
      setError(UNEXPECTED_MESSAGE);
      throw loadError;
    }
  }, [token]);

  // Todavía no hay avisos push: la lista se actualiza cada vez que el motorista vuelve a esta pestaña.
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  async function refresh() {
    setIsRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setIsRefreshing(false);
    }
  }

  return { orders, error, isRefreshing, refresh };
}
