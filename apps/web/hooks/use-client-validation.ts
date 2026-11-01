import { useState, type FormEvent } from "react";
import type { ZodType } from "zod";
import { toFieldErrors, type FieldErrors } from "@/lib/form-state";

export function useClientValidation(schema: ZodType) {
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = schema.safeParse(values);
    if (result.success) {
      setClientErrors({});
      return;
    }
    event.preventDefault();
    setClientErrors(toFieldErrors(result.error.issues));
  }

  return { clientErrors, validateBeforeSubmit };
}
