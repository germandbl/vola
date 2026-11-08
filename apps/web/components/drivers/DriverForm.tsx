"use client";

import {
  MIN_PASSWORD_LENGTH,
  type DriverForm as DriverFormValues,
  type DriverMerchant,
} from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDriverForm, type DriverTextField } from "@/hooks/use-driver-form";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { MerchantCheckboxes } from "./MerchantCheckboxes";

interface TextFieldConfig {
  field: DriverTextField;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel";
}

const TEXT_FIELDS: TextFieldConfig[] = [
  { field: "name", label: "Nombre", placeholder: "Ej. Óscar Mendoza", type: "text" },
  { field: "email", label: "Email", placeholder: "Ej. oscar.mendoza@minegocio.com", type: "email" },
  { field: "phoneNumber", label: "Teléfono", placeholder: "Ej. +504 9999 8888", type: "tel" },
];

interface DriverFormProps {
  save: (form: DriverFormValues) => Promise<DriverSaveResult>;
  merchants: DriverMerchant[];
}

export function DriverForm({ save, merchants }: DriverFormProps) {
  const form = useDriverForm(
    save,
    merchants.map((merchant) => merchant.id),
  );
  const { fieldErrors, formError } = form.result;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        <div className="grid gap-7 md:grid-cols-2">
          {TEXT_FIELDS.map(({ field, label, placeholder, type }) => (
            <Field key={field} data-invalid={Boolean(fieldErrors[field])}>
              <FieldLabel htmlFor={field}>{label}</FieldLabel>
              <Input
                id={field}
                type={type}
                autoComplete="off"
                placeholder={placeholder}
                value={form.fields[field]}
                onChange={(event) => form.updateField(field, event.target.value)}
                aria-invalid={Boolean(fieldErrors[field])}
              />
              <FieldError>{fieldErrors[field]}</FieldError>
            </Field>
          ))}
          <Field data-invalid={Boolean(fieldErrors.password)}>
            <FieldLabel htmlFor="password">Contraseña para la app</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
              value={form.fields.password}
              onChange={(event) => form.updateField("password", event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <FieldError>{fieldErrors.password}</FieldError>
          </Field>
        </div>
        <MerchantCheckboxes
          merchants={merchants}
          selectedMerchantIds={form.selectedMerchantIds}
          error={fieldErrors.merchantIds}
          onToggle={form.toggleMerchant}
        />
        <Button type="submit" disabled={form.isPending} className="self-start">
          {form.isPending && <Spinner data-icon="inline-start" />}
          {form.isPending ? "Creando motorista…" : "Crear motorista"}
        </Button>
      </FieldGroup>
    </form>
  );
}
