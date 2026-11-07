import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OrderCountRangeInput } from "@/hooks/use-order-count-fee-rate-form";
import { MoneyInput } from "@/components/MoneyInput";

interface OrderCountRangeFieldsProps {
  range: OrderCountRangeInput;
  fromOrder: string;
  isLastRange: boolean;
  canRemove: boolean;
  currency: string | null;
  errors: { upToOrderCount?: string; fee?: string };
  onChange: (field: "upToOrderCount" | "fee", value: string) => void;
  onRemove: () => void;
}

export function OrderCountRangeFields({
  range,
  fromOrder,
  isLastRange,
  canRemove,
  currency,
  errors,
  onChange,
  onRemove,
}: OrderCountRangeFieldsProps) {
  const upToOrderCountId = `upToOrderCount-${range.key}`;
  const feeId = `fee-${range.key}`;

  return (
    <li className="grid grid-cols-[1fr_1fr_auto] items-start gap-x-4 gap-y-2 rounded-lg border p-4 sm:grid-cols-[9rem_1fr_1fr_auto]">
      <p className="col-span-3 text-sm font-semibold sm:col-span-1 sm:pt-8">
        Desde el pedido {fromOrder}
      </p>
      <Field data-invalid={Boolean(errors.upToOrderCount)}>
        <FieldLabel htmlFor={upToOrderCountId}>Hasta el pedido</FieldLabel>
        <Input
          id={upToOrderCountId}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder={isLastRange ? "En adelante" : "Ej. 100"}
          value={isLastRange ? "" : range.upToOrderCount}
          disabled={isLastRange}
          onChange={(event) => onChange("upToOrderCount", event.target.value)}
          aria-invalid={Boolean(errors.upToOrderCount)}
        />
        <FieldError>{errors.upToOrderCount}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.fee)}>
        <FieldLabel htmlFor={feeId}>Costo por pedido</FieldLabel>
        <MoneyInput
          id={feeId}
          currency={currency}
          placeholder="Ej. 30"
          value={range.fee}
          onChange={(event) => onChange("fee", event.target.value)}
          aria-invalid={Boolean(errors.fee)}
        />
        <FieldError>{errors.fee}</FieldError>
      </Field>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-7"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label={`Quitar el rango desde el pedido ${fromOrder}`}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
