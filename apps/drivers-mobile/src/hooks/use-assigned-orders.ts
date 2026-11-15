import type { DriverOrder } from "@vola/shared";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { ApiUnreachableError } from "@/lib/api";
import { requestAssignedOrders } from "@/lib/order-api";
import { useSignedInSession } from "@/session/SessionProvider";

export const ASSIGNED_ORDERS_INTERVAL_MS = 10_000;

const UNREACHABLE_MESSAGE = "No hay conexión con Volá!. Deslizá hacia abajo para probar de nuevo.";
const UNEXPECTED_MESSAGE = "No pudimos cargar tus órdenes. Deslizá hacia abajo para probar de nuevo.";

export function useAssignedOrders() {
  const { token } = useSignedInSession();
  const [orders, setOrders] = useState<DriverOrder[] | null>(null);
  const [error, setError] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Cada recarga suma un ciclo: la cuenta de 10 segundos y la barra vuelven a empezar desde ahí.
  const [cycle, setCycle] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await requestAssignedOrders(token));
      setError(undefined);
    } catch (loadError) {
      // Sin conexión se queda la última lista: la siguiente recarga lo vuelve a intentar.
      if (loadError instanceof ApiUnreachableError) {
        setError(UNREACHABLE_MESSAGE);
        return;
      }
      setError(UNEXPECTED_MESSAGE);
      throw loadError;
    }
  }, [token]);

  const reloadAndRestart = useCallback(() => {
    setCycle((current) => current + 1);
    loadOrders();
  }, [loadOrders]);

  // useFocusEffect no se dispara al volver de otra app: AppState cubre ese caso.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      reloadAndRestart();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") reloadAndRestart();
      });
      return () => {
        setIsFocused(false);
        subscription.remove();
      };
    }, [reloadAndRestart]),
  );

  // Solo con la lista en pantalla y la app abierta; en segundo plano espera a que vuelva.
  useEffect(() => {
    if (!isFocused) return;
    const timeoutId = setTimeout(() => {
      if (AppState.currentState === "active") reloadAndRestart();
    }, ASSIGNED_ORDERS_INTERVAL_MS);
    return () => clearTimeout(timeoutId);
  }, [cycle, isFocused, reloadAndRestart]);

  async function refresh() {
    setIsRefreshing(true);
    setCycle((current) => current + 1);
    try {
      await loadOrders();
    } finally {
      setIsRefreshing(false);
    }
  }

  return { orders, error, isRefreshing, cycle, refresh };
}
