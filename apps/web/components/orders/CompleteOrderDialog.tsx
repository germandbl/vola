"use client";

import type { OrderDetail } from "@vola/shared";
import { CircleCheck } from "lucide-react";
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
import { useOrderActions } from "@/hooks/use-order-actions";

interface CompleteOrderDialogProps {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}

export function CompleteOrderDialog({ order, onUpdated }: CompleteOrderDialogProps) {
  const actions = useOrderActions(order, onUpdated);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <CircleCheck data-icon="inline-start" />
          Completar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar la orden #{order.id}</DialogTitle>
          <DialogDescription>
            La orden queda como entregada y el motorista ya no la verá como activa.
          </DialogDescription>
        </DialogHeader>
        {actions.error && <FormErrorAlert message={actions.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={actions.isPending} onClick={actions.complete}>
            {actions.isPending && <Spinner data-icon="inline-start" />}
            {actions.isPending ? "Completando…" : "Marcar entregada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
