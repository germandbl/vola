import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { OpeningHoursInput } from "@/hooks/use-branch-form";
import { DAY_OF_WEEK_LABEL } from "@/lib/labels";

interface OpeningHoursFieldsProps {
  hours: OpeningHoursInput;
  errors: { opensAt?: string; closesAt?: string };
  onChange: (changes: Partial<OpeningHoursInput>) => void;
}

export function OpeningHoursFields({ hours, errors, onChange }: OpeningHoursFieldsProps) {
  const dayLabel = DAY_OF_WEEK_LABEL[hours.day];
  const switchId = `isOpen-${hours.day}`;
  const opensAtId = `opensAt-${hours.day}`;
  const closesAtId = `closesAt-${hours.day}`;

  return (
    <li className="grid grid-cols-2 items-start gap-x-4 gap-y-2 rounded-lg border p-4 sm:grid-cols-[7rem_8rem_1fr_1fr]">
      <p className="font-semibold sm:pt-8">{dayLabel}</p>
      <Field orientation="horizontal" className="sm:pt-8">
        <Switch
          id={switchId}
          checked={hours.isOpen}
          onCheckedChange={(isOpen) => onChange({ isOpen })}
        />
        <FieldLabel htmlFor={switchId}>{hours.isOpen ? "Abierta" : "Cerrada"}</FieldLabel>
      </Field>
      {hours.isOpen && (
        <>
          <Field data-invalid={Boolean(errors.opensAt)}>
            <FieldLabel htmlFor={opensAtId}>Abre</FieldLabel>
            <Input
              id={opensAtId}
              type="time"
              value={hours.opensAt}
              onChange={(event) => onChange({ opensAt: event.target.value })}
              aria-invalid={Boolean(errors.opensAt)}
            />
            <FieldError>{errors.opensAt}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.closesAt)}>
            <FieldLabel htmlFor={closesAtId}>Cierra</FieldLabel>
            <Input
              id={closesAtId}
              type="time"
              value={hours.closesAt}
              onChange={(event) => onChange({ closesAt: event.target.value })}
              aria-invalid={Boolean(errors.closesAt)}
            />
            <FieldError>{errors.closesAt}</FieldError>
          </Field>
        </>
      )}
    </li>
  );
}
