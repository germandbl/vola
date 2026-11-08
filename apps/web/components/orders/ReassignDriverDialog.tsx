"use client";

import { orderAssignmentFormSchema, type OrderDetail } from "@vola/shared";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toDriverId, useDriverOptions } from "@/hooks/use-driver-options";
import { useOrderActions } from "@/hooks/use-order-actions";

interface ReassignDriverDialogProps {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}

export function ReassignDriverDialog({ order, onUpdated }: ReassignDriverDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { driverOptions, loadError } = useDriverOptions(order.id, isOpen);
  const actions = useOrderActions(order, onUpdated);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driverError, setDriverError] = useState<string>();
  const fieldId = `reassign-driver-${order.id}`;

  function submit() {
    const validation = orderAssignmentFormSchema.safeParse({
      driverId: toDriverId(selectedDriverId),
    });
    if (!validation.success) {
      setDriverError(validation.error.issues[0].message);
      return;
    }
    setDriverError(undefined);
    actions.reassignDriver(validation.data.driverId, () => setIsOpen(false));
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <RefreshCw data-icon="inline-start" />
          Reasignar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar la orden #{order.id}</DialogTitle>
          <DialogDescription>
            {order.driver?.name} deja de verla y la orden vuelve a Nueva para el motorista que
            elijás.
          </DialogDescription>
        </DialogHeader>
        {actions.error && <FormErrorAlert message={actions.error} />}
        {loadError && <FormErrorAlert message={loadError} />}
        {driverOptions === null && !loadError && <Spinner />}
        {driverOptions?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay otros motoristas disponibles para este comercio.
          </p>
        )}
        {driverOptions && driverOptions.length > 0 && (
          <Field data-invalid={Boolean(driverError)}>
            <FieldLabel htmlFor={fieldId}>Nuevo motorista</FieldLabel>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger id={fieldId} className="w-full">
                <SelectValue placeholder="Elegí un motorista disponible" />
              </SelectTrigger>
              <SelectContent>
                {driverOptions.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id.toString()}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{driverError}</FieldError>
          </Field>
        )}
        <DialogFooter>
          <Button disabled={actions.isPending || !driverOptions?.length} onClick={submit}>
            {actions.isPending && <Spinner data-icon="inline-start" />}
            {actions.isPending ? "Reasignando…" : "Reasignar motorista"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
