"use client";

import type { PendingSoftwareInvoice } from "@vola/shared";
import { FileText } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { MoneyInput } from "@/components/MoneyInput";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useCreateSoftwareInvoice } from "@/hooks/use-create-software-invoice";
import { formatMoney, formatPeriod } from "@/lib/labels";
import { SoftwareChargeLines } from "./SoftwareChargeLines";

interface CreateSoftwareInvoiceDialogProps {
  pendingInvoice: PendingSoftwareInvoice;
}

export function CreateSoftwareInvoiceDialog({ pendingInvoice }: CreateSoftwareInvoiceDialogProps) {
  const dialog = useCreateSoftwareInvoice(pendingInvoice);
  const { fieldErrors, formError } = dialog.result;
  const { contractCurrency, invoiceCurrency } = pendingInvoice;

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
            Uso del software en {formatPeriod(pendingInvoice.period)}, según su contrato.
          </DialogDescription>
        </DialogHeader>
        <SoftwareChargeLines {...pendingInvoice} />
        {dialog.needsExchangeRate && (
          <Field data-invalid={Boolean(fieldErrors.exchangeRate)}>
            <FieldLabel htmlFor="exchangeRate">Tasa de cambio</FieldLabel>
            <MoneyInput
              id="exchangeRate"
              currency={invoiceCurrency}
              step="0.0001"
              placeholder="Ej. 24.7135"
              value={dialog.exchangeRate}
              onChange={(event) => dialog.setExchangeRate(event.target.value)}
              aria-invalid={Boolean(fieldErrors.exchangeRate)}
            />
            <FieldDescription>
              Cuánto vale 1 {contractCurrency} en {invoiceCurrency} hoy. Queda guardada en la factura.
            </FieldDescription>
            <FieldError>{fieldErrors.exchangeRate}</FieldError>
          </Field>
        )}
        <div className="flex justify-between px-3 text-base font-semibold">
          <span>Total a facturar</span>
          <span>{dialog.convertedTotal === null ? "—" : formatMoney(dialog.convertedTotal, invoiceCurrency)}</span>
        </div>
        {fieldErrors.period && <FormErrorAlert message={fieldErrors.period} />}
        {formError && <FormErrorAlert message={formError} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={dialog.isPending} onClick={dialog.confirm}>
            {dialog.isPending && <Spinner data-icon="inline-start" />}
            {dialog.isPending ? "Generando…" : "Generar factura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
