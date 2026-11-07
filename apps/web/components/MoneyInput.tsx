import type { ComponentProps } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { getCurrencySymbol } from "@/lib/labels";

interface MoneyInputProps extends ComponentProps<typeof InputGroupInput> {
  currency: string | null;
}

export function MoneyInput({ currency, ...inputProps }: MoneyInputProps) {
  return (
    <InputGroup>
      {currency && (
        <InputGroupAddon>
          <InputGroupText>{getCurrencySymbol(currency)}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput type="number" inputMode="decimal" min="0" step="0.01" {...inputProps} />
    </InputGroup>
  );
}
