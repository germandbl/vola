"use client";

import type { PendingMerchantCash } from "@vola/shared";
import { loadMerchantSettlementOrders, settleMerchantCash } from "@/lib/settlement-actions";
import { SettleCashDialog } from "./SettleCashDialog";

interface SettleMerchantCashDialogProps {
  merchant: PendingMerchantCash;
}

export function SettleMerchantCashDialog({ merchant }: SettleMerchantCashDialogProps) {
  return (
    <SettleCashDialog
      title={`Liquidar a ${merchant.organizationName}`}
      description="Confirmá cuando le entregués el efectivo: se liquidan todas estas órdenes, sin descontar el envío de Volá!."
      triggerLabel="Liquidar al comercio"
      confirmLabel="Confirmar entregado"
      totalLabel="Total a entregar"
      currency={merchant.currency}
      loadOrders={() => loadMerchantSettlementOrders(merchant.organizationId)}
      settle={() => settleMerchantCash(merchant.organizationId)}
    />
  );
}
