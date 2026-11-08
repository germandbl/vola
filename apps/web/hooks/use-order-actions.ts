import type { OrderCancellationForm, OrderDetail, OrderPreparationForm } from "@vola/shared";
import { useState, useTransition } from "react";
import {
  cancelOrder,
  changeOrderPreparation,
  completeOrder,
  reassignOrderDriver,
  releaseOrderDriver,
  type OrderActionResult,
} from "@/lib/order-detail-actions";

export function useOrderActions(order: OrderDetail, onUpdated: (order: OrderDetail) => void) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<OrderActionResult>, onSaved?: () => void) {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      setError(result.error);
      if (!result.order) return;
      onUpdated(result.order);
      onSaved?.();
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

  function reassignDriver(driverId: number, onSaved: () => void) {
    run(() => reassignOrderDriver(order.id, { driverId }), onSaved);
  }

  function releaseDriver(onSaved: () => void) {
    run(() => releaseOrderDriver(order.id), onSaved);
  }

  return { error, isPending, changePreparation, complete, cancel, reassignDriver, releaseDriver };
}
