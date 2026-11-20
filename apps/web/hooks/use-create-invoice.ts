import type { InvoiceOrder } from "@vola/shared";
import { useState, useTransition } from "react";
import { createInvoice, loadPendingInvoiceOrders } from "@/lib/invoice-actions";

type OrdersState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; orders: InvoiceOrder[] }
  | { kind: "failed" };

// Las órdenes se cargan al abrir el diálogo: así se confirma exactamente lo que se va a facturar.
export function useCreateInvoice(organizationId: number) {
  const [isOpen, setIsOpen] = useState(false);
  const [ordersState, setOrdersState] = useState<OrdersState>({ kind: "idle" });
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setError(undefined);
    if (!nextIsOpen) return;
    setOrdersState({ kind: "loading" });
    loadPendingInvoiceOrders(organizationId)
      .then((orders) => setOrdersState({ kind: "loaded", orders }))
      .catch((loadError: unknown) => {
        setOrdersState({ kind: "failed" });
        throw loadError;
      });
  }

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      const result = await createInvoice(organizationId);
      setError(result.error);
      if (result.isCreated) setIsOpen(false);
    });
  }

  return { isOpen, ordersState, error, isPending, changeOpen, confirm };
}
