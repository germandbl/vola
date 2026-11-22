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
import { formatMoney } from "@/lib/labels";
import { InvoiceRangeFields } from "./InvoiceRangeFields";
import { SoftwareChargeLines } from "./SoftwareChargeLines";

interface CreateSoftwareInvoiceDialogProps {
  pendingInvoice: PendingSoftwareInvoice;
}

export function CreateSoftwareInvoiceDialog({ pendingInvoice }: CreateSoftwareInvoiceDialogProps) {
  const dialog = useCreateSoftwareInvoice(pendingInvoice);
  const { fieldErrors, previewState } = dialog;
  const { contractCurrency, invoiceCurrency } = pendingInvoice;
  const isLoaded = previewState.kind === "loaded";

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
            Uso del software en esas fechas. El costo mensual y las órdenes incluidas se prorratean por días.
          </DialogDescription>
        </DialogHeader>
        <InvoiceRangeFields
          range={dialog.range}
          lastBillableDate={pendingInvoice.lastBillableDate}
          errors={fieldErrors}
          onChange={dialog.changeRange}
        />
        {previewState.kind === "loading" && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {previewState.kind === "failed" && previewState.message && (
          <FormErrorAlert message={previewState.message} />
        )}
        {previewState.kind === "loaded" && <SoftwareChargeLines {...previewState.charge} />}
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
        {dialog.formError && <FormErrorAlert message={dialog.formError} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={!isLoaded || dialog.isPending} onClick={dialog.confirm}>
            {dialog.isPending && <Spinner data-icon="inline-start" />}
            {dialog.isPending ? "Generando…" : "Generar factura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
