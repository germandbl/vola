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
    if (body.success) {
      return { values, fieldErrors: toFieldErrors(body.data.issues) };
    }
    return { values, fieldErrors: {}, formError: "Revisá los datos y probá de nuevo." };
  }
  if (response.status === HTTP_CONFLICT) {
    return {
      values,
      fieldErrors: { email: "Ya existe un usuario con ese email. Usá otro." },
    };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { values, fieldErrors: {}, formError: "No tenés permiso para hacer esto." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { values, fieldErrors: {}, formError: "No encontramos esta organización." };
  }
  return {
    values,
    fieldErrors: {},
    formError: "No pudimos guardar. Probá de nuevo en un momento.",
  };
}

async function sendForm(
  path: string,
  method: "POST" | "PATCH",
  values: Record<string, string>,
): Promise<Response> {
  return fetchWithSession(path, { method, body: JSON.stringify(values) });
}

export async function createOrganization(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await sendForm("/organizations", "POST", values);
  if (!response.ok) return toErrorState(response, values);

  const { id } = z.object({ id: z.number() }).parse(await response.json());
  redirect(`/organizaciones/${id}`);
}

export async function updateOrganization(
  organizationId: number,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await sendForm(`/organizations/${organizationId}`, "PATCH", values);
  if (!response.ok) return toErrorState(response, values);

  refresh();
  return { values, fieldErrors: {}, isSaved: true };
}

export async function createUser(
  organizationId: number,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readFormValues(formData);
  const response = await sendForm(
    `/organizations/${organizationId}/users`,
    "POST",
    values,
  );
  if (!response.ok) return toErrorState(response, values);

  redirect(`/organizaciones/${organizationId}`);
}
