"use server";

import type { DriverForm, DriverMerchantsForm } from "@vola/shared";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface DriverSaveResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

async function toErrorResult(response: Response): Promise<DriverSaveResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
    return {
      fieldErrors: {},
      formError: "Tu organización no tiene país. Pedile a Volá! que lo configure.",
    };
  }
  if (response.status === HTTP_CONFLICT) {
    return { fieldErrors: { email: "Ya existe un usuario con ese email. Usá otro." } };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { fieldErrors: {}, formError: "No tenés permiso para gestionar motoristas." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { fieldErrors: {}, formError: "No encontramos este motorista." };
  }
  return { fieldErrors: {}, formError: "No pudimos guardar. Probá de nuevo en un momento." };
}

export async function createDriver(form: DriverForm): Promise<DriverSaveResult> {
  const response = await fetchWithSession("/drivers", {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  redirect("/motoristas");
}

export async function updateDriverMerchants(
  driverId: number,
  form: DriverMerchantsForm,
): Promise<DriverSaveResult> {
  const response = await fetchWithSession(`/drivers/${driverId}/merchants`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  refresh();
  return { fieldErrors: {}, isSaved: true };
}
