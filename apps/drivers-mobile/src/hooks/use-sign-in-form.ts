import { loginSchema } from "@vola/shared";
import { useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { SignInError } from "@/lib/auth-api";
import { useSession } from "@/session/SessionProvider";

type SignInField = "email" | "password";

const UNREACHABLE_MESSAGE = "No pudimos conectarnos con Volá!. Revisá tu internet y probá de nuevo.";
const UNEXPECTED_MESSAGE = "No pudimos iniciar sesión. Probá de nuevo en un momento.";

export function useSignInForm() {
  const { signIn } = useSession();
  const [fields, setFields] = useState<Record<SignInField, string>>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignInField, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  function updateField(field: SignInField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    const validation = loginSchema.safeParse(fields);
    if (!validation.success) {
      const errors: Partial<Record<SignInField, string>> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as SignInField;
        errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(undefined);
    setIsPending(true);
    try {
      await signIn(validation.data);
    } catch (error) {
      if (error instanceof SignInError) {
        setFormError(error.message);
      } else if (error instanceof ApiUnreachableError) {
        setFormError(UNREACHABLE_MESSAGE);
      } else {
        setFormError(UNEXPECTED_MESSAGE);
        throw error;
      }
    } finally {
      setIsPending(false);
    }
  }

  return { fields, fieldErrors, formError, isPending, updateField, submit };
}
