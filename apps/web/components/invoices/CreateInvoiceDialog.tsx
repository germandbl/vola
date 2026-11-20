"use client";

import type { InvoiceOrder, PendingInvoice } from "@vola/shared";
import { FileText } from "lucide-react";
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
import { useCreateInvoice } from "@/hooks/use-create-invoice";
import { formatDateTime, formatMoney } from "@/lib/labels";

interface InvoiceOrdersListProps {
  orders: InvoiceOrder[];
  currency: string | null;
}

function InvoiceOrdersList({ orders, currency }: InvoiceOrdersListProps) {
  const total = orders.reduce((sum, order) => sum + order.deliveryFee, 0);
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
            <span className="shrink-0">{formatMoney(order.deliveryFee, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between px-3 text-base font-semibold">
        <span>Total a facturar</span>
        <span>{formatMoney(total, currency)}</span>
      </div>
    </div>
  );
}

interface CreateInvoiceDialogProps {
  pendingInvoice: PendingInvoice;
}

export function CreateInvoiceDialog({ pendingInvoice }: CreateInvoiceDialogProps) {
  const dialog = useCreateInvoice(pendingInvoice.organizationId);
  const { ordersState } = dialog;
  const hasOrders = ordersState.kind === "loaded" && ordersState.orders.length > 0;

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText data-icon="inline-start" />
          Generar factura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Facturar a {pendingInvoice.organizationName}</DialogTitle>
          <DialogDescription>
            La factura lleva el envío de todas estas órdenes, que entregaron motoristas de Volá!.
          </DialogDescription>
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
          <p className="text-sm text-muted-foreground">Ya no hay órdenes por facturar.</p>
        )}
        {ordersState.kind === "loaded" && hasOrders && (
          <InvoiceOrdersList orders={ordersState.orders} currency={pendingInvoice.currency} />
        )}
        {dialog.error && <FormErrorAlert message={dialog.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={!hasOrders || dialog.isPending} onClick={dialog.confirm}>
            {dialog.isPending && <Spinner data-icon="inline-start" />}
            {dialog.isPending ? "Generando…" : "Generar factura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
