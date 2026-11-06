"use client";

import type { OrderCountFeeRate } from "@vola/shared";
import { Plus } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  useOrderCountFeeRateForm,
  type OrderCountRangeInput,
} from "@/hooks/use-order-count-fee-rate-form";
import { OrderCountRangeFields } from "./OrderCountRangeFields";

function getFromOrder(ranges: OrderCountRangeInput[], index: number): string {
  if (index === 0) return "1";
  const previousUpToOrderCount = Number.parseInt(ranges[index - 1].upToOrderCount, 10);
  if (Number.isNaN(previousUpToOrderCount)) return "…";
  return String(previousUpToOrderCount + 1);
}

interface OrderCountFeeRateFormProps {
  organizationId: number;
  currency: string | null;
  initialRate: OrderCountFeeRate;
}

export function OrderCountFeeRateForm({
  organizationId,
  currency,
  initialRate,
}: OrderCountFeeRateFormProps) {
  const form = useOrderCountFeeRateForm(organizationId, initialRate);
  const { fieldErrors, formError, isSaved } = form.result;
  const lastIndex = form.ranges.length - 1;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <FieldSet>
          <FieldLegend>Rangos de pedidos del mes</FieldLegend>
          <FieldDescription>
            Cada pedido paga el costo del rango donde cae su número en el mes. El último rango
            cubre todos los pedidos que siguen; el conteo vuelve a empezar cada mes.
          </FieldDescription>
          <ol className="flex flex-col gap-2">
            {form.ranges.map((range, index) => (
              <OrderCountRangeFields
                key={range.key}
                range={range}
                fromOrder={getFromOrder(form.ranges, index)}
                isLastRange={index === lastIndex}
                canRemove={form.ranges.length > 1}
                currency={currency}
                errors={{
                  upToOrderCount: fieldErrors[`ranges.${index}.upToOrderCount`],
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
