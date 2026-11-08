import type { DriverMerchant } from "@vola/shared";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

interface MerchantCheckboxesProps {
  merchants: DriverMerchant[];
  selectedMerchantIds: number[];
  error?: string;
  onToggle: (merchantId: number, isSelected: boolean) => void;
}

export function MerchantCheckboxes({
  merchants,
  selectedMerchantIds,
  error,
  onToggle,
}: MerchantCheckboxesProps) {
  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend>Comercios que atiende</FieldLegend>
      <FieldDescription>Solo recibe órdenes de las sucursales de estos comercios.</FieldDescription>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {merchants.map((merchant) => {
          const checkboxId = `merchant-${merchant.id}`;
          return (
            <Field key={merchant.id} orientation="horizontal">
              <Checkbox
                id={checkboxId}
                checked={selectedMerchantIds.includes(merchant.id)}
                onCheckedChange={(checked) => onToggle(merchant.id, checked === true)}
                aria-invalid={Boolean(error)}
              />
              <FieldLabel htmlFor={checkboxId} className="font-normal">
                {merchant.name}
              </FieldLabel>
            </Field>
          );
        })}
      </div>
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}
