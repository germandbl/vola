import { orderAssignmentFormSchema, type OrderDriver } from "@vola/shared";
import { useEffect, useState, useTransition } from "react";
import {
  assignOrderDriver,
  loadOrderDriverOptions,
  type OrderAssignmentResult,
} from "@/lib/order-assignment-actions";
import { toFieldErrors } from "@/lib/form-state";

// Sin elegir, el select queda en "": se manda vacío para que la validación diga "Elegí un motorista".
function toDriverId(selectedDriverId: string): number | undefined {
  if (selectedDriverId === "") return undefined;
  return Number(selectedDriverId);
}

export function useOrderAssignment(orderId: number, isOpen: boolean) {
  const [driverOptions, setDriverOptions] = useState<OrderDriver[] | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [result, setResult] = useState<OrderAssignmentResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  // La disponibilidad cambia todo el tiempo: se piden los motoristas cada vez que se abre el diálogo.
  useEffect(() => {
    if (!isOpen) return;
    loadOrderDriverOptions(orderId)
      .then(setDriverOptions)
      .catch((error: unknown) => {
        setLoadError("No pudimos cargar los motoristas. Cerrá y probá de nuevo.");
        throw error;
      });
  }, [isOpen, orderId]);

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
