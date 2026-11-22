import type { InvoiceRange } from "@vola/shared";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FieldErrors } from "@/lib/form-state";

interface InvoiceRangeFieldsProps {
  range: InvoiceRange;
  lastBillableDate: string;
  errors: FieldErrors;
  onChange: (field: keyof InvoiceRange, value: string) => void;
}

export function InvoiceRangeFields({ range, lastBillableDate, errors, onChange }: InvoiceRangeFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field data-invalid={Boolean(errors.from)}>
        <FieldLabel htmlFor="invoiceFrom">Desde</FieldLabel>
        <Input
          id="invoiceFrom"
          type="date"
          max={lastBillableDate}
          value={range.from}
          onChange={(event) => onChange("from", event.target.value)}
          aria-invalid={Boolean(errors.from)}
        />
        <FieldError>{errors.from}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.to)}>
        <FieldLabel htmlFor="invoiceTo">Hasta</FieldLabel>
        <Input
          id="invoiceTo"
          type="date"
          max={lastBillableDate}
          value={range.to}
          onChange={(event) => onChange("to", event.target.value)}
          aria-invalid={Boolean(errors.to)}
        />
        <FieldError>{errors.to}</FieldError>
      </Field>
    </div>
  );
}
