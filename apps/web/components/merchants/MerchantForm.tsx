"use client";

import { merchantFormSchema, type Merchant } from "@vola/shared";
import { useActionState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useClientValidation } from "@/hooks/use-client-validation";
import { INITIAL_FORM_STATE, type FormState } from "@/lib/form-state";

interface MerchantFormProps {
  action: (previousState: FormState, formData: FormData) => Promise<FormState>;
  merchant?: Merchant;
  submitLabel: string;
  pendingLabel: string;
}

export function MerchantForm({ action, merchant, submitLabel, pendingLabel }: MerchantFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_FORM_STATE);
  const { clientErrors, validateBeforeSubmit } = useClientValidation(merchantFormSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate>
      <FieldGroup>
        {state.formError && <FormErrorAlert message={state.formError} />}
        <div className="grid gap-7 md:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="name">Nombre del comercio</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Ej. Licuados Doña Mary"
              defaultValue={state.values.name ?? merchant?.name}
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.contactName)}>
            <FieldLabel htmlFor="contactName">Encargado</FieldLabel>
            <Input
              id="contactName"
              name="contactName"
              autoComplete="off"
              placeholder="Ej. Karla Mejía"
              defaultValue={state.values.contactName ?? merchant?.contactName}
              aria-invalid={Boolean(errors.contactName)}
            />
            <FieldError>{errors.contactName}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.contactEmail)}>
            <FieldLabel htmlFor="contactEmail">Correo</FieldLabel>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              autoComplete="off"
              placeholder="Ej. contacto@minegocio.com"
              defaultValue={state.values.contactEmail ?? merchant?.contactEmail}
              aria-invalid={Boolean(errors.contactEmail)}
            />
            <FieldError>{errors.contactEmail}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.contactPhone)}>
            <FieldLabel htmlFor="contactPhone">Teléfono</FieldLabel>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              autoComplete="off"
              placeholder="Ej. +504 9999 8888"
              defaultValue={state.values.contactPhone ?? merchant?.contactPhone}
              aria-invalid={Boolean(errors.contactPhone)}
            />
            <FieldError>{errors.contactPhone}</FieldError>
          </Field>
        </div>
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
