import type { OrderDetail, OrderPreparationForm } from "@vola/shared";
import { useState, useTransition } from "react";
import { changeOrderPreparation, type OrderActionResult } from "@/lib/order-detail-actions";

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

  return { error, isPending, changePreparation };
}
