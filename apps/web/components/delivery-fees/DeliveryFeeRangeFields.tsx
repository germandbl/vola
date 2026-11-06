import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { RangeInput } from "@/hooks/use-delivery-fee-rate-form";
import { MoneyInput } from "./MoneyInput";

interface DeliveryFeeRangeFieldsProps {
  range: RangeInput;
  fromKm: string;
  isOpenRange: boolean;
  canRemove: boolean;
  currency: string | null;
  errors: { upToKm?: string; fee?: string };
  onChange: (field: "upToKm" | "fee", value: string) => void;
  onRemove: () => void;
}

export function DeliveryFeeRangeFields({
  range,
  fromKm,
  isOpenRange,
  canRemove,
  currency,
  errors,
  onChange,
  onRemove,
}: DeliveryFeeRangeFieldsProps) {
  const upToKmId = `upToKm-${range.key}`;
  const feeId = `fee-${range.key}`;

  return (
    <li className="grid grid-cols-[1fr_1fr_auto] items-start gap-x-4 gap-y-2 rounded-lg border p-4 sm:grid-cols-[7rem_1fr_1fr_auto]">
      <p className="col-span-3 text-sm font-semibold sm:col-span-1 sm:pt-8">Desde {fromKm} km</p>
      <Field data-invalid={Boolean(errors.upToKm)}>
        <FieldLabel htmlFor={upToKmId}>Hasta (km)</FieldLabel>
        <Input
          id={upToKmId}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder={isOpenRange ? "Sin límite" : "Ej. 3"}
          value={isOpenRange ? "" : range.upToKm}
          disabled={isOpenRange}
          onChange={(event) => onChange("upToKm", event.target.value)}
          aria-invalid={Boolean(errors.upToKm)}
        />
        <FieldError>{errors.upToKm}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.fee)}>
        <FieldLabel htmlFor={feeId}>Costo</FieldLabel>
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
        aria-label={`Quitar el rango desde ${fromKm} km`}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
