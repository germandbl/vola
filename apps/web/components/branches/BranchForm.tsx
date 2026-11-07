"use client";

import type { Branch, BranchForm as BranchFormValues } from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useBranchForm, type BranchTextField } from "@/hooks/use-branch-form";
import type { BranchSaveResult } from "@/lib/branch-actions";
import type { Coordinates } from "@/lib/map-defaults";
import { LocationPicker } from "./LocationPicker";
import { OpeningHoursFields } from "./OpeningHoursFields";

interface BranchFormProps {
  save: (form: BranchFormValues) => Promise<BranchSaveResult>;
  initialLocation: Coordinates;
  branch?: Branch;
  submitLabel: string;
  pendingLabel: string;
}

export function BranchForm({
  save,
  initialLocation,
  branch,
  submitLabel,
  pendingLabel,
}: BranchFormProps) {
  const form = useBranchForm(save, initialLocation, branch);
  const { fieldErrors, formError, isSaved } = form.result;
  const locationError = fieldErrors.latitude ?? fieldErrors.longitude;

  function renderTextField(field: BranchTextField, label: string, placeholder: string) {
    return (
      <Field data-invalid={Boolean(fieldErrors[field])}>
        <FieldLabel htmlFor={field}>{label}</FieldLabel>
        <Input
          id={field}
          placeholder={placeholder}
          value={form.fields[field]}
          onChange={(event) => form.updateField(field, event.target.value)}
          aria-invalid={Boolean(fieldErrors[field])}
        />
        <FieldError>{fieldErrors[field]}</FieldError>
      </Field>
    );
  }

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <div className="grid gap-6 lg:grid-cols-2">
          <FieldGroup>
            {renderTextField("name", "Nombre de la sucursal", "Ej. Col. Palmira")}
            {renderTextField("address", "Dirección", "Ej. Col. Palmira, frente al parque")}
            <FieldSet>
              <FieldLegend>Ubicación</FieldLegend>
              <LocationPicker
                initialLocation={initialLocation}
                location={form.location}
                onChange={form.setLocation}
              />
              {locationError && <FieldError>{locationError}</FieldError>}
            </FieldSet>
          </FieldGroup>
          <FieldSet>
            <FieldLegend>Horario</FieldLegend>
            <ol className="flex flex-col gap-2">
              {form.openingHours.map((hours, index) => (
                <OpeningHoursFields
                  key={hours.day}
                  hours={hours}
                  errors={{
                    opensAt: fieldErrors[`openingHours.${index}.opensAt`],
                    closesAt: fieldErrors[`openingHours.${index}.closesAt`],
                  }}
                  onChange={(changes) => form.updateOpeningHours(hours.day, changes)}
                />
              ))}
            </ol>
            {fieldErrors.openingHours && <FieldError>{fieldErrors.openingHours}</FieldError>}
          </FieldSet>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={form.isPending}>
            {form.isPending && <Spinner data-icon="inline-start" />}
            {form.isPending ? pendingLabel : submitLabel}
          </Button>
          {isSaved && <p className="text-sm text-muted-foreground">Cambios guardados.</p>}
        </div>
      </FieldGroup>
    </form>
  );
}
