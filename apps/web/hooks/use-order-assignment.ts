import { orderAssignmentFormSchema } from "@vola/shared";
import { useState, useTransition } from "react";
import { assignOrderDriver, type OrderAssignmentResult } from "@/lib/order-assignment-actions";
import { toFieldErrors } from "@/lib/form-state";
import { toDriverId, useDriverOptions } from "./use-driver-options";

export function useOrderAssignment(orderId: number, isOpen: boolean) {
  const { driverOptions, loadError } = useDriverOptions(orderId, isOpen);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [result, setResult] = useState<OrderAssignmentResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function assign(onAssigned: () => void) {
    const validation = orderAssignmentFormSchema.safeParse({
      driverId: toDriverId(selectedDriverId),
    });
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      const assignmentResult = await assignOrderDriver(orderId, validation.data);
      setResult(assignmentResult);
      if (assignmentResult.isSaved) onAssigned();
    });
  }

  return {
    driverOptions,
    loadError,
    selectedDriverId,
    result,
    isPending,
    setSelectedDriverId,
    assign,
  };
}
