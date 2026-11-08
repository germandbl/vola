import type { OrderCancellationForm, OrderDetail, OrderPreparationForm } from "@vola/shared";
import { useState, useTransition } from "react";
import {
  cancelOrder,
  changeOrderPreparation,
  completeOrder,
  type OrderActionResult,
} from "@/lib/order-detail-actions";

export function useOrderActions(order: OrderDetail, onUpdated: (order: OrderDetail) => void) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<OrderActionResult>) {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (result.order) onUpdated(result.order);
      setError(result.error);
    });
  }

  function changePreparation(preparationStatus: OrderPreparationForm["preparationStatus"]) {
    run(() => changeOrderPreparation(order.id, { preparationStatus }));
  }

  function complete() {
    run(() => completeOrder(order.id));
  }

  function cancel(form: OrderCancellationForm) {
    run(() => cancelOrder(order.id, form));
  }

  return { error, isPending, changePreparation, complete, cancel };
}
