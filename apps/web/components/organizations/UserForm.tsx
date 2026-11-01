"use client";

import { ASSIGNABLE_ROLES, RoleName, userFormSchema } from "@vola/shared";
import { useActionState } from "react";
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
import { useClientValidation } from "@/hooks/use-client-validation";
import { INITIAL_FORM_STATE, type FormState } from "@/lib/form-state";
import { ROLE_LABEL } from "@/lib/labels";

interface UserFormProps {
  action: (previousState: FormState, formData: FormData) => Promise<FormState>;
}

export function UserForm({ action }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_FORM_STATE);
  const { clientErrors, validateBeforeSubmit } = useClientValidation(userFormSchema);
  const errors = { ...state.fieldErrors, ...clientErrors };

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate>
      <FieldGroup>
        {state.formError && <FormErrorAlert message={state.formError} />}
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="off"
            placeholder="Ej. Karla Mejía"
            defaultValue={state.values.name}
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="Ej. karla.mejia@minegocio.com"
            defaultValue={state.values.email}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.phoneNumber)}>
          <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="off"
            placeholder="Ej. +504 9999 8888"
            defaultValue={state.values.phoneNumber}
            aria-invalid={Boolean(errors.phoneNumber)}
          />
          <FieldError>{errors.phoneNumber}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            defaultValue={state.values.password}
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.role)}>
          <FieldLabel htmlFor="role">Rol</FieldLabel>
          <Select name="role" defaultValue={state.values.role ?? RoleName.Agent}>
            <SelectTrigger id="role" className="w-full" aria-invalid={Boolean(errors.role)}>
              <SelectValue placeholder="Elegí un rol" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABEL[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.role}</FieldError>
        </Field>
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending && <Spinner data-icon="inline-start" />}
          {isPending ? "Creando usuario…" : "Crear usuario"}
        </Button>
      </FieldGroup>
    </form>
  );
}
