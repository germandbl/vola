"use client";

import type { PendingDriverCash } from "@vola/shared";
import { loadDriverSettlementOrders, settleDriverCash } from "@/lib/settlement-actions";
import { SettleCashDialog } from "./SettleCashDialog";

interface SettleDriverCashDialogProps {
  driver: PendingDriverCash;
}

export function SettleDriverCashDialog({ driver }: SettleDriverCashDialogProps) {
  return (
    <SettleCashDialog
      title={`Recibir el efectivo de ${driver.driverName}`}
      description="Contá el efectivo antes de confirmar: se liquidan todas estas órdenes."
      triggerLabel="Recibir efectivo"
      confirmLabel="Confirmar recibido"
      totalLabel="Total a recibir"
      currency={driver.currency}
      loadOrders={() => loadDriverSettlementOrders(driver.driverId)}
      settle={() => settleDriverCash(driver.driverId)}
    />
  );
}
