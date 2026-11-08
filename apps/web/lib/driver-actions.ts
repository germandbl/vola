"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FormState } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

function readFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

async function toErrorState(
  response: Response,
  values: Record<string, string>,
): Promise<FormState> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { values, fieldErrors: toFieldErrors(body.data.issues) };
    return {
      values,
      fieldErrors: {},
      formError: "Tu organización no tiene país. Pedile a Volá! que lo configure.",
    };
  }
  if (response.status === HTTP_CONFLICT) {
    return { values, fieldErrors: { email: "Ya existe un usuario con ese email. Usá otro." } };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { values, fieldErrors: {}, formError: "No tenés permiso para crear motoristas." };
  }
  return {
    values,
    fieldErrors: {},
    formError: "No pudimos crear el motorista. Probá de nuevo en un momento.",
  };
}

export async function createDriver(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await fetchWithSession("/drivers", {
    method: "POST",
    body: JSON.stringify(values),
  });
  if (!response.ok) return toErrorState(response, values);

  redirect("/motoristas");
}
