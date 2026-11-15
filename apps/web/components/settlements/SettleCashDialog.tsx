"use client";

import type { SettlementOrder } from "@vola/shared";
import { HandCoins } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useSettleCash } from "@/hooks/use-settle-cash";
import { formatDateTime, formatMoney } from "@/lib/labels";
import type { SettleCashResult } from "@/lib/settlement-actions";

interface SettlementOrdersListProps {
  orders: SettlementOrder[];
  currency: string | null;
  totalLabel: string;
}

function SettlementOrdersList({ orders, currency, totalLabel }: SettlementOrdersListProps) {
  const total = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex max-h-72 flex-col divide-y overflow-y-auto rounded-lg border">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold">
                Orden #{order.id} · {order.merchantName}
              </span>
              <span className="truncate text-muted-foreground">
                {order.customerName} · {formatDateTime(order.deliveredAt)}
              </span>
            </div>
            <span className="shrink-0">{formatMoney(order.total, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between px-3 text-base font-semibold">
        <span>{totalLabel}</span>
        <span>{formatMoney(total, currency)}</span>
      </div>
    </div>
  );
}

interface SettleCashDialogProps {
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel: string;
  totalLabel: string;
  currency: string | null;
  loadOrders: () => Promise<SettlementOrder[]>;
  settle: () => Promise<SettleCashResult>;
}

export function SettleCashDialog(props: SettleCashDialogProps) {
  const dialog = useSettleCash({ loadOrders: props.loadOrders, settle: props.settle });
  const { ordersState } = dialog;
  const hasOrders = ordersState.kind === "loaded" && ordersState.orders.length > 0;

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandCoins data-icon="inline-start" />
          {props.triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {ordersState.kind === "loading" && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {ordersState.kind === "failed" && (
          <FormErrorAlert message="No pudimos cargar las órdenes. Cerrá y probá de nuevo." />
        )}
        {ordersState.kind === "loaded" && !hasOrders && (
          <p className="text-sm text-muted-foreground">Ya no hay efectivo pendiente.</p>
        )}
        {ordersState.kind === "loaded" && hasOrders && (
          <SettlementOrdersList
            orders={ordersState.orders}
            currency={props.currency}
            totalLabel={props.totalLabel}
          />
        )}
        {dialog.error && <FormErrorAlert message={dialog.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={!hasOrders || dialog.isPending} onClick={dialog.confirm}>
            {dialog.isPending && <Spinner data-icon="inline-start" />}
            {dialog.isPending ? "Registrando…" : props.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
