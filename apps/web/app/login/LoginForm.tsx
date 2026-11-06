"use client";

import { useActionState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login, type LoginState } from "@/lib/auth-actions";

const INITIAL_LOGIN_STATE: LoginState = { email: "", fieldErrors: {} };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, INITIAL_LOGIN_STATE);
  const { fieldErrors } = state;

  return (
    // noValidate para mostrar nuestros mensajes en español en lugar de los del navegador.
    <form action={formAction} noValidate>
      <FieldGroup>
        {state.formError && <FormErrorAlert message={state.formError} />}
        <Field data-invalid={Boolean(fieldErrors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="Ej. minegocio@gmail.com"
            defaultValue={state.email}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Contraseña..."
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
        </Field>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Spinner data-icon="inline-start" />}
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  );
}
