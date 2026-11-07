"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FormState } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
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
    return { values, fieldErrors: {}, formError: "Revisá los datos y probá de nuevo." };
  }
  if (response.status === HTTP_CONFLICT) {
    return {
      values,
      fieldErrors: { name: "Ya hay un comercio con ese nombre en esta organización. Usá otro." },
    };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { values, fieldErrors: {}, formError: "No tenés permiso para gestionar comercios." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { values, fieldErrors: {}, formError: "No encontramos este comercio." };
  }
  return { values, fieldErrors: {}, formError: "No pudimos guardar. Probá de nuevo en un momento." };
}

export async function createMerchant(
  organizationId: number,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await fetchWithSession(`/organizations/${organizationId}/merchants`, {
    method: "POST",
    body: JSON.stringify(values),
  });
  if (!response.ok) return toErrorState(response, values);

  const { id } = z.object({ id: z.number() }).parse(await response.json());
  redirect(`/organizaciones/${organizationId}/comercios/${id}`);
}

export async function updateMerchant(
  merchantId: number,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await fetchWithSession(`/merchants/${merchantId}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
  if (!response.ok) return toErrorState(response, values);

  refresh();
  return { values, fieldErrors: {}, isSaved: true };
}
