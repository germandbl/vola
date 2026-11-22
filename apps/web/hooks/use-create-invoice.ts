import { invoiceRangeSchema, type InvoiceOrder, type InvoiceRange, type PendingInvoice } from "@vola/shared";
import { useRef, useState, useTransition } from "react";
import { toFieldErrors, type FieldErrors } from "@/lib/form-state";
import { createInvoice, loadPendingInvoiceOrders } from "@/lib/invoice-actions";

type OrdersState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; orders: InvoiceOrder[] }
  | { kind: "failed"; message?: string };

// Las órdenes se recargan con cada rango: así se confirma exactamente lo que se va a facturar.
export function useCreateInvoice(pendingInvoice: PendingInvoice) {
  const initialRange = { from: pendingInvoice.firstDeliveryDate, to: pendingInvoice.lastBillableDate };
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<InvoiceRange>(initialRange);
  const [ordersState, setOrdersState] = useState<OrdersState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  // Si el rango cambia antes de que responda la carga anterior, esa respuesta ya no sirve.
  const latestLoad = useRef(0);

  function loadOrders(nextRange: InvoiceRange) {
    const validation = invoiceRangeSchema.safeParse(nextRange);
    if (!validation.success) {
      setFieldErrors(toFieldErrors(validation.error.issues));
      setOrdersState({ kind: "idle" });
      return;
    }
    setFieldErrors({});
    setOrdersState({ kind: "loading" });
    latestLoad.current += 1;
    const loadNumber = latestLoad.current;
    loadPendingInvoiceOrders(pendingInvoice.organizationId, validation.data).then((result) => {
      if (loadNumber !== latestLoad.current) return;
      setFieldErrors(result.fieldErrors);
      if (result.data) {
        setOrdersState({ kind: "loaded", orders: result.data });
        return;
      }
      setOrdersState({ kind: "failed", message: result.formError });
    });
  }

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setFormError(undefined);
    if (!nextIsOpen) return;
    setRange(initialRange);
    loadOrders(initialRange);
  }

  function changeRange(field: keyof InvoiceRange, value: string) {
    const nextRange = { ...range, [field]: value };
    setRange(nextRange);
    loadOrders(nextRange);
  }

  function confirm() {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createInvoice(pendingInvoice.organizationId, range);
      setFieldErrors(result.fieldErrors);
      setFormError(result.formError);
      if (result.isDone) setIsOpen(false);
    });
  }

  return { isOpen, range, ordersState, fieldErrors, formError, isPending, changeOpen, changeRange, confirm };
}
