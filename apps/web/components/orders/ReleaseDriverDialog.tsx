"use client";

import type { OrderDetail } from "@vola/shared";
import { UserMinus } from "lucide-react";
import { useState } from "react";
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

interface ReleaseDriverDialogProps {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}

export function ReleaseDriverDialog({ order, onUpdated }: ReleaseDriverDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actions = useOrderActions(order, onUpdated);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <UserMinus data-icon="inline-start" />
          Liberar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar la orden #{order.id}</DialogTitle>
          <DialogDescription>
            {order.driver?.name} deja de verla. La orden queda Nueva y sin motorista, lista para
            asignarla de nuevo.
          </DialogDescription>
        </DialogHeader>
        {actions.error && <FormErrorAlert message={actions.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button
            disabled={actions.isPending}
            onClick={() => actions.releaseDriver(() => setIsOpen(false))}
          >
            {actions.isPending && <Spinner data-icon="inline-start" />}
            {actions.isPending ? "Liberando…" : "Liberar orden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
