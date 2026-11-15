import type { OrderDetail } from "@vola/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { useLiveOrders } from "@/components/orders/LiveOrdersProvider";
import { loadOrderDetail } from "@/lib/order-detail-actions";
import { ORDER_DETAIL_PARAM } from "@/lib/order-detail-param";

function readOrderId(param: string | null): number | null {
  if (param === null) return null;
  const orderId = Number(param);
  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  return orderId;
}

type OrderDetailState =
  | { kind: "loading" }
  | { kind: "loaded"; order: OrderDetail }
  | { kind: "missing" }
  | { kind: "failed" };

// La orden abierta vive en la URL: se puede compartir y el botón atrás cierra el panel.
export function useOrderDetailSheet() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const orderId = readOrderId(searchParams.get(ORDER_DETAIL_PARAM));
  const [state, setState] = useState<OrderDetailState>({ kind: "loading" });
  const [loadedOrderId, setLoadedOrderId] = useState<number | null>(null);

  if (orderId !== loadedOrderId) {
    setLoadedOrderId(orderId);
    setState({ kind: "loading" });
  }

  // En Activas, el detalle abierto se recarga en el mismo ciclo que la tabla.
  const liveCycle = useLiveOrders()?.cycle;
  const reloadOpenOrder = useEffectEvent(() => {
    if (orderId === null || state.kind !== "loaded") return;
    loadOrderDetail(orderId).then((order) => {
      if (order) setState({ kind: "loaded", order });
    });
  });

  useEffect(() => {
    if (!liveCycle) return;
    reloadOpenOrder();
  }, [liveCycle]);

  useEffect(() => {
    if (orderId === null) return;
    loadOrderDetail(orderId)
      .then((order) => setState(order ? { kind: "loaded", order } : { kind: "missing" }))
      .catch((error: unknown) => {
        setState({ kind: "failed" });
        throw error;
      });
  }, [orderId]);

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete(ORDER_DETAIL_PARAM);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // Después de una acción, el API devuelve la orden ya actualizada.
  function showUpdatedOrder(order: OrderDetail) {
    setState({ kind: "loaded", order });
  }

  return { isOpen: orderId !== null, orderId, state, close, showUpdatedOrder };
}
