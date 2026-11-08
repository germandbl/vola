import {
  OrderStatus,
  findDriverNextStatus,
  orderStatusChangeFormSchema,
  type DriverOrderDetail,
  type OrderStatusChangeForm,
} from "@vola/shared";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import {
  OrderStatusConflictError,
  requestOrderDetail,
  requestStatusChange,
} from "@/lib/order-api";
import { useSignedInSession } from "@/session/SessionProvider";

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiUnreachableError) {
    return "No hay conexión con Volá!. Revisá tu internet y probá de nuevo.";
  }
  if (error instanceof OrderStatusConflictError) {
    return "Esta orden cambió mientras tanto. Volvé a la lista para ver cómo quedó.";
  }
  return "Algo falló de nuestro lado. Probá de nuevo en un momento.";
}

function isExpectedError(error: unknown): boolean {
  return error instanceof ApiUnreachableError || error instanceof OrderStatusConflictError;
}

export function useOrderDetail(orderId: number) {
  const { token } = useSignedInSession();
  const [order, setOrder] = useState<DriverOrderDetail | null>(null);
  const [error, setError] = useState<string>();
  const [cancellationReasonError, setCancellationReasonError] = useState<string>();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setOrder(await requestOrderDetail(token, orderId));
      setError(undefined);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
      if (!isExpectedError(loadError)) throw loadError;
    }
  }, [token, orderId]);

  // Se recarga cada vez que la pantalla vuelve a estar a la vista, igual que la lista.
  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [loadOrder]),
  );

  // El comercio puede cambiar la preparación mientras el motorista mira el detalle.
  async function refresh() {
    setIsRefreshing(true);
    try {
      await loadOrder();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function changeStatus(form: OrderStatusChangeForm) {
    setError(undefined);
    setIsChangingStatus(true);
    try {
      setOrder(await requestStatusChange(token, orderId, form));
    } catch (changeError) {
      setError(toErrorMessage(changeError));
      if (!isExpectedError(changeError)) throw changeError;
    } finally {
      setIsChangingStatus(false);
    }
  }

  function advance() {
    if (!order) return;
    const nextStatus = findDriverNextStatus(order.status);
    if (nextStatus === null || nextStatus === OrderStatus.Cancelled) return;
    const validation = orderStatusChangeFormSchema.safeParse({ status: nextStatus });
    if (validation.success) changeStatus(validation.data);
  }

  function cancel(cancellationReason: string) {
    const validation = orderStatusChangeFormSchema.safeParse({
      status: OrderStatus.Cancelled,
      cancellationReason,
    });
    if (!validation.success) {
      setCancellationReasonError(validation.error.issues[0].message);
      return;
    }
    setCancellationReasonError(undefined);
    changeStatus(validation.data);
  }

  return {
    order,
    error,
    cancellationReasonError,
    isChangingStatus,
    isRefreshing,
    refresh,
    advance,
    cancel,
  };
}
