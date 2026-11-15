import type { SettlementOrder } from "@vola/shared";
import { useState, useTransition } from "react";
import type { SettleCashResult } from "@/lib/settlement-actions";

type OrdersState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; orders: SettlementOrder[] }
  | { kind: "failed" };

interface SettleCashActions {
  loadOrders: () => Promise<SettlementOrder[]>;
  settle: () => Promise<SettleCashResult>;
}

// Las órdenes se cargan al abrir el diálogo: así se confirma exactamente lo que se va a liquidar.
export function useSettleCash({ loadOrders, settle }: SettleCashActions) {
  const [isOpen, setIsOpen] = useState(false);
  const [ordersState, setOrdersState] = useState<OrdersState>({ kind: "idle" });
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setError(undefined);
    if (!nextIsOpen) return;
    setOrdersState({ kind: "loading" });
    loadOrders()
      .then((orders) => setOrdersState({ kind: "loaded", orders }))
      .catch((loadError: unknown) => {
        setOrdersState({ kind: "failed" });
        throw loadError;
      });
  }

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      const result = await settle();
      setError(result.error);
      if (result.isSettled) setIsOpen(false);
    });
  }

  return { isOpen, ordersState, error, isPending, changeOpen, confirm };
}
