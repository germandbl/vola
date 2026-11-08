"use client";

import { orderCancellationFormSchema, type OrderDetail } from "@vola/shared";
import { CircleX } from "lucide-react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useOrderActions } from "@/hooks/use-order-actions";

interface CancelOrderDialogProps {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}

export function CancelOrderDialog({ order, onUpdated }: CancelOrderDialogProps) {
  const actions = useOrderActions(order, onUpdated);
  const [cancellationReason, setCancellationReason] = useState("");
  const [reasonError, setReasonError] = useState<string>();
  const fieldId = `cancellation-reason-${order.id}`;

  function submit() {
    const validation = orderCancellationFormSchema.safeParse({ cancellationReason });
    if (!validation.success) {
      setReasonError(validation.error.issues[0].message);
      return;
    }
    setReasonError(undefined);
    actions.cancel(validation.data);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <CircleX data-icon="inline-start" />
          Cancelar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar la orden #{order.id}</DialogTitle>
          <DialogDescription>
            La orden sale de las activas y el motorista deja de verla. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {actions.error && <FormErrorAlert message={actions.error} />}
        <Field data-invalid={Boolean(reasonError)}>
          <FieldLabel htmlFor={fieldId}>Motivo</FieldLabel>
          <Textarea
            id={fieldId}
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
            placeholder="Ej. El cliente ya no quiere el pedido"
            aria-invalid={Boolean(reasonError)}
          />
          <FieldError>{reasonError}</FieldError>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={actions.isPending} onClick={submit}>
            {actions.isPending && <Spinner data-icon="inline-start" />}
            {actions.isPending ? "Cancelando…" : "Cancelar orden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
