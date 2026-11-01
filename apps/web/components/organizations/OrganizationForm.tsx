"use client";

import {
  OrganizationType,
  organizationFormSchema,
  type Country,
  type Organization,
} from "@vola/shared";
import { useActionState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
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
import { useClientValidation } from "@/hooks/use-client-validation";
import { INITIAL_FORM_STATE, type FormState } from "@/lib/form-state";
import { ORGANIZATION_TYPE_LABEL } from "@/lib/labels";

interface OrganizationFormProps {
  action: (previousState: FormState, formData: FormData) => Promise<FormState>;
  countries: Country[];
  organization?: Organization;
  submitLabel: string;
  pendingLabel: string;
}

export function OrganizationForm({
  action,
  countries,
  organization,
  submitLabel,
  pendingLabel,
}: OrganizationFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_FORM_STATE);
  const { clientErrors, validateBeforeSubmit } = useClientValidation(organizationFormSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };
  const defaultCountryId = state.values.countryId ?? organization?.countryId?.toString();

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate>
      <FieldGroup>
        {state.formError && <FormErrorAlert message={state.formError} />}
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Ej. Baleadas Doña Mary"
            defaultValue={state.values.name ?? organization?.name}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.countryId)}>
          <FieldLabel htmlFor="countryId">País</FieldLabel>
          <Select name="countryId" defaultValue={defaultCountryId}>
            <SelectTrigger id="countryId" className="w-full" aria-invalid={Boolean(errors.countryId)}>
              <SelectValue placeholder="Elegí un país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.countryId}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.type)}>
          <FieldLabel htmlFor="type">Tipo</FieldLabel>
          <Select
            name="type"
            defaultValue={state.values.type ?? organization?.type ?? OrganizationType.Merchant}
          >
            <SelectTrigger id="type" className="w-full" aria-invalid={Boolean(errors.type)}>
              <SelectValue placeholder="Elegí el tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrganizationType).map((type) => (
                <SelectItem key={type} value={type}>
                  {ORGANIZATION_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.type}</FieldError>
        </Field>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? pendingLabel : submitLabel}
          </Button>
          {state.isSaved && <p className="text-sm text-muted-foreground">Cambios guardados.</p>}
        </div>
      </FieldGroup>
    </form>
  );
}
