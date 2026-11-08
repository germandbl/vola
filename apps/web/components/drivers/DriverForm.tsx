"use client";

import {
  MIN_PASSWORD_LENGTH,
  type DriverForm as DriverFormValues,
  type DriverMerchant,
  type DriverOwner,
} from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useDriverForm, type DriverTextField } from "@/hooks/use-driver-form";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { MerchantCheckboxes } from "./MerchantCheckboxes";
import { MerchantMultiSelect } from "./MerchantMultiSelect";

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
  owners: DriverOwner[];
  merchants: DriverMerchant[];
  // Volá! puede tener muchos comercios para elegir: usa un buscador en lugar de casillas.
  isMerchantSearchable: boolean;
}

function describeOwner(owner: DriverOwner): string {
  if (owner.isPlatform) return `${owner.name} (motorista de la plataforma)`;
  return owner.name;
}

export function DriverForm({ save, owners, merchants, isMerchantSearchable }: DriverFormProps) {
  const form = useDriverForm(save, owners, merchants);
  const { fieldErrors, formError } = form.result;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        {owners.length > 1 && (
          <Field data-invalid={Boolean(fieldErrors.organizationId)} className="md:max-w-md">
            <FieldLabel htmlFor="organizationId">Pertenece a</FieldLabel>
            <Select value={form.owner.id.toString()} onValueChange={form.selectOwner}>
              <SelectTrigger id="organizationId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id.toString()}>
                    {describeOwner(owner)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{fieldErrors.organizationId}</FieldError>
          </Field>
        )}
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
        {isMerchantSearchable ? (
          <MerchantMultiSelect
            merchants={form.servableMerchants}
            selectedMerchantIds={form.selectedMerchantIds}
            error={fieldErrors.merchantIds}
            onToggle={form.toggleMerchants}
          />
        ) : (
          <MerchantCheckboxes
            merchants={form.servableMerchants}
            selectedMerchantIds={form.selectedMerchantIds}
            error={fieldErrors.merchantIds}
            onToggle={form.toggleMerchants}
          />
        )}
        <Button type="submit" disabled={form.isPending} className="self-start">
          {form.isPending && <Spinner data-icon="inline-start" />}
          {form.isPending ? "Creando motorista…" : "Crear motorista"}
        </Button>
      </FieldGroup>
    </form>
  );
}
