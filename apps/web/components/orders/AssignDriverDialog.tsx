"use client";

import { UserPlus } from "lucide-react";
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
import { useOrderAssignment } from "@/hooks/use-order-assignment";

interface AssignDriverDialogProps {
  orderId: number;
}

export function AssignDriverDialog({ orderId }: AssignDriverDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const assignment = useOrderAssignment(orderId, isOpen);
  const { driverOptions, result } = assignment;
  const fieldId = `driver-${orderId}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus data-icon="inline-start" />
          Asignar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar la orden #{orderId}</DialogTitle>
          <DialogDescription>
            Solo aparecen los motoristas disponibles que atienden el comercio de esta orden.
          </DialogDescription>
        </DialogHeader>
        {result.formError && <FormErrorAlert message={result.formError} />}
        {assignment.loadError && <FormErrorAlert message={assignment.loadError} />}
        {driverOptions === null && !assignment.loadError && <Spinner />}
        {driverOptions?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay motoristas disponibles para este comercio. Pediles que se marquen disponibles
            en la app.
          </p>
        )}
        {driverOptions && driverOptions.length > 0 && (
          <Field data-invalid={Boolean(result.fieldErrors.driverId)}>
            <FieldLabel htmlFor={fieldId}>Motorista</FieldLabel>
            <Select
              value={assignment.selectedDriverId}
              onValueChange={assignment.setSelectedDriverId}
            >
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
            <FieldError>{result.fieldErrors.driverId}</FieldError>
          </Field>
        )}
        <DialogFooter>
          <Button
            disabled={assignment.isPending || !driverOptions?.length}
            onClick={() => assignment.assign(() => setIsOpen(false))}
          >
            {assignment.isPending && <Spinner data-icon="inline-start" />}
            {assignment.isPending ? "Asignando…" : "Asignar motorista"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
