import type { OrderDriver } from "@vola/shared";
import { useEffect, useState } from "react";
import { loadOrderDriverOptions } from "@/lib/order-assignment-actions";

// Sin elegir, el select queda en "": se manda vacío para que la validación diga "Elegí un motorista".
export function toDriverId(selectedDriverId: string): number | undefined {
  if (selectedDriverId === "") return undefined;
  return Number(selectedDriverId);
}

export function useDriverOptions(orderId: number, isOpen: boolean) {
  const [driverOptions, setDriverOptions] = useState<OrderDriver[] | null>(null);
  const [loadError, setLoadError] = useState<string>();

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

  return { driverOptions, loadError };
}
