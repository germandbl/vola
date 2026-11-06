"use client";

import type { DeliveryFeeRate } from "@vola/shared";
import { Plus } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useDeliveryFeeRateForm, type RangeInput } from "@/hooks/use-delivery-fee-rate-form";
import { DeliveryFeeRangeFields } from "./DeliveryFeeRangeFields";
import { MoneyInput } from "./MoneyInput";

function getFromKm(ranges: RangeInput[], index: number): string {
  if (index === 0) return "0";
  return ranges[index - 1].upToKm || "…";
}

interface DeliveryFeeRateFormProps {
  organizationId: number;
  currency: string | null;
  initialRate: DeliveryFeeRate;
}

export function DeliveryFeeRateForm({ organizationId, currency, initialRate }: DeliveryFeeRateFormProps) {
  const form = useDeliveryFeeRateForm(organizationId, initialRate);
  const { fieldErrors, formError, isSaved } = form.result;
  const lastIndex = form.ranges.length - 1;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <FieldSet>
          <FieldLegend>Rangos de distancia</FieldLegend>
          <FieldDescription>
            Cada rango empieza donde termina el anterior y cobra un costo fijo.
          </FieldDescription>
          <ol className="flex flex-col gap-2">
            {form.ranges.map((range, index) => (
              <DeliveryFeeRangeFields
                key={range.key}
                range={range}
                fromKm={getFromKm(form.ranges, index)}
                isOpenRange={index === lastIndex && !form.hasExtraFee}
                canRemove={form.ranges.length > 1}
                currency={currency}
                errors={{
                  upToKm: fieldErrors[`ranges.${index}.upToKm`],
                  fee: fieldErrors[`ranges.${index}.fee`],
                }}
                onChange={(field, value) => form.updateRange(range.key, field, value)}
                onRemove={() => form.removeRange(range.key)}
              />
            ))}
          </ol>
          {fieldErrors.ranges && <FieldError>{fieldErrors.ranges}</FieldError>}
          <Button type="button" variant="outline" className="self-start" onClick={form.addRange}>
            <Plus data-icon="inline-start" />
            Agregar rango
          </Button>
        </FieldSet>
        <Field orientation="horizontal">
          <Switch
            id="hasExtraFee"
            checked={form.hasExtraFee}
            onCheckedChange={form.setHasExtraFee}
          />
          <FieldContent>
            <FieldLabel htmlFor="hasExtraFee">Cobrar por km extra</FieldLabel>
            <FieldDescription>
              Después del último rango se cobra cada km empezado. Si no, el último rango no tiene
              límite.
            </FieldDescription>
          </FieldContent>
        </Field>
        {form.hasExtraFee && (
          <Field data-invalid={Boolean(fieldErrors.extraFeePerKm)} className="max-w-xs">
            <FieldLabel htmlFor="extraFeePerKm">Costo por km extra</FieldLabel>
            <MoneyInput
              id="extraFeePerKm"
              currency={currency}
              placeholder="Ej. 8"
              value={form.extraFeePerKm}
              onChange={(event) => form.setExtraFeePerKm(event.target.value)}
              aria-invalid={Boolean(fieldErrors.extraFeePerKm)}
            />
            <FieldError>{fieldErrors.extraFeePerKm}</FieldError>
          </Field>
        )}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={form.isPending}>
            {form.isPending && <Spinner data-icon="inline-start" />}
            {form.isPending ? "Guardando…" : "Guardar tarifa"}
          </Button>
          {isSaved && <p className="text-sm text-muted-foreground">Tarifa guardada.</p>}
        </div>
      </FieldGroup>
    </form>
  );
}
