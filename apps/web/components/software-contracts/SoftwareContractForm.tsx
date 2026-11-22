"use client";

import { CONTRACT_CURRENCY_LABEL, ContractCurrency, type SoftwareContract } from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSoftwareContractForm } from "@/hooks/use-software-contract-form";

interface SoftwareContractFormProps {
  organizationId: number;
  contract: SoftwareContract | null;
}

export function SoftwareContractForm({ organizationId, contract }: SoftwareContractFormProps) {
  const form = useSoftwareContractForm(organizationId, contract);
  const { fieldErrors, formError, isSaved } = form.result;
  const { inputs } = form;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldErrors.currency)}>
            <FieldLabel htmlFor="currency">Moneda del contrato</FieldLabel>
            <Select value={inputs.currency} onValueChange={(value) => form.changeInput("currency", value)}>
              <SelectTrigger id="currency" className="w-full" aria-invalid={Boolean(fieldErrors.currency)}>
                <SelectValue placeholder="Elegí una moneda" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ContractCurrency).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {CONTRACT_CURRENCY_LABEL[currency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Al facturar se convierte a la moneda del país del cliente.</FieldDescription>
            <FieldError>{fieldErrors.currency}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.startPeriod)}>
            <FieldLabel htmlFor="startPeriod">Vigente desde</FieldLabel>
            <Input
              id="startPeriod"
              type="month"
              value={inputs.startPeriod}
              onChange={(event) => form.changeInput("startPeriod", event.target.value)}
              aria-invalid={Boolean(fieldErrors.startPeriod)}
            />
            <FieldDescription>El primer mes que se puede facturar.</FieldDescription>
            <FieldError>{fieldErrors.startPeriod}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.monthlyFee)}>
            <FieldLabel htmlFor="monthlyFee">Costo mensual</FieldLabel>
            <MoneyInput
              id="monthlyFee"
              currency={inputs.currency}
              placeholder="Ej. 150"
              value={inputs.monthlyFee}
              onChange={(event) => form.changeInput("monthlyFee", event.target.value)}
              aria-invalid={Boolean(fieldErrors.monthlyFee)}
            />
            <FieldDescription>Cubre las órdenes incluidas. Usá 0 si solo se cobra por orden.</FieldDescription>
            <FieldError>{fieldErrors.monthlyFee}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.includedOrders)}>
            <FieldLabel htmlFor="includedOrders">Órdenes incluidas al mes</FieldLabel>
            <Input
              id="includedOrders"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="Ej. 500"
              value={inputs.includedOrders}
              onChange={(event) => form.changeInput("includedOrders", event.target.value)}
              aria-invalid={Boolean(fieldErrors.includedOrders)}
            />
            <FieldDescription>Con 0, todas las órdenes entregadas se cobran como excedente.</FieldDescription>
            <FieldError>{fieldErrors.includedOrders}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.extraOrderFee)}>
            <FieldLabel htmlFor="extraOrderFee">Precio por orden excedente</FieldLabel>
            <MoneyInput
              id="extraOrderFee"
              currency={inputs.currency}
              placeholder="Ej. 0.35"
              value={inputs.extraOrderFee}
              onChange={(event) => form.changeInput("extraOrderFee", event.target.value)}
              aria-invalid={Boolean(fieldErrors.extraOrderFee)}
            />
            <FieldError>{fieldErrors.extraOrderFee}</FieldError>
          </Field>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={form.isPending}>
            {form.isPending && <Spinner data-icon="inline-start" />}
            {form.isPending ? "Guardando…" : "Guardar contrato"}
          </Button>
          {isSaved && <p className="text-sm text-muted-foreground">Contrato guardado.</p>}
        </div>
      </FieldGroup>
    </form>
  );
}
