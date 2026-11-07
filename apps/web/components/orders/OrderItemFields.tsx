import { calculateItemTotal } from "@vola/shared";
import { Trash2 } from "lucide-react";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OrderItemField, OrderItemInput } from "@/hooks/use-order-form";
import { formatMoney } from "@/lib/labels";

interface OrderItemFieldsProps {
  item: OrderItemInput;
  currency: string | null;
  canRemove: boolean;
  errors: Partial<Record<OrderItemField, string>>;
  onChange: (field: OrderItemField, value: string) => void;
  onRemove: () => void;
}

function calculateDisplayedTotal(item: OrderItemInput): number {
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0;
  return calculateItemTotal({ name: item.name, quantity, unitPrice });
}

export function OrderItemFields({
  item,
  currency,
  canRemove,
  errors,
  onChange,
  onRemove,
}: OrderItemFieldsProps) {
  const nameId = `itemName-${item.key}`;
  const quantityId = `itemQuantity-${item.key}`;
  const unitPriceId = `itemUnitPrice-${item.key}`;

  return (
    <li className="grid grid-cols-[5rem_1fr_auto] items-start gap-x-4 gap-y-2 rounded-lg border p-4 sm:grid-cols-[1fr_5rem_9rem_auto]">
      <Field data-invalid={Boolean(errors.name)} className="col-span-3 sm:col-span-1">
        <FieldLabel htmlFor={nameId}>Producto</FieldLabel>
        <Input
          id={nameId}
          placeholder="Ej. Baleada sencilla"
          value={item.name}
          onChange={(event) => onChange("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError>{errors.name}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.quantity)}>
        <FieldLabel htmlFor={quantityId}>Cantidad</FieldLabel>
        <Input
          id={quantityId}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder="Ej. 2"
          value={item.quantity}
          onChange={(event) => onChange("quantity", event.target.value)}
          aria-invalid={Boolean(errors.quantity)}
        />
        <FieldError>{errors.quantity}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.unitPrice)}>
        <FieldLabel htmlFor={unitPriceId}>Precio</FieldLabel>
        <MoneyInput
          id={unitPriceId}
          currency={currency}
          placeholder="Ej. 25"
          value={item.unitPrice}
          onChange={(event) => onChange("unitPrice", event.target.value)}
          aria-invalid={Boolean(errors.unitPrice)}
        />
        <FieldError>{errors.unitPrice}</FieldError>
      </Field>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-7"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label={`Quitar ${item.name || "este producto"}`}
      >
        <Trash2 />
      </Button>
      <p className="col-span-3 text-right text-sm text-muted-foreground sm:col-span-4">
        Subtotal {formatMoney(calculateDisplayedTotal(item), currency)}
      </p>
    </li>
  );
}
