import { PAYMENT_METHOD_LABEL, PaymentMethod, paymentMethodSchema } from "@vola/shared";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PAYMENT_METHOD_DESCRIPTION: Record<PaymentMethod, string> = {
  [PaymentMethod.Card]: "El cliente ya pagó. El motorista no cobra al entregar.",
  [PaymentMethod.Cash]: "El motorista cobra el total al entregar.",
};

const PAYMENT_METHODS = [PaymentMethod.Card, PaymentMethod.Cash];

interface PaymentMethodFieldProps {
  value: PaymentMethod | null;
  error?: string;
  onChange: (paymentMethod: PaymentMethod) => void;
}

export function PaymentMethodField({ value, error, onChange }: PaymentMethodFieldProps) {
  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend variant="label">Método de pago</FieldLegend>
      <RadioGroup
        value={value ?? ""}
        onValueChange={(selected) => onChange(paymentMethodSchema.parse(selected))}
        aria-invalid={Boolean(error)}
      >
        {PAYMENT_METHODS.map((paymentMethod) => (
          <Field key={paymentMethod} orientation="horizontal">
            <RadioGroupItem
              id={`paymentMethod-${paymentMethod}`}
              value={paymentMethod}
              aria-invalid={Boolean(error)}
            />
            <FieldContent>
              <FieldLabel htmlFor={`paymentMethod-${paymentMethod}`}>
                {PAYMENT_METHOD_LABEL[paymentMethod]}
              </FieldLabel>
              <FieldDescription>{PAYMENT_METHOD_DESCRIPTION[paymentMethod]}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}
