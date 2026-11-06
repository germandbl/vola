"use server";

import type { DeliveryFeeRateForm } from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface DeliveryFeeRateSaveResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

async function toErrorResult(response: Response): Promise<DeliveryFeeRateSaveResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
    return { fieldErrors: {}, formError: "Solo los comercios tienen tarifa de envío." };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { fieldErrors: {}, formError: "No tenés permiso para cambiar tarifas de envío." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { fieldErrors: {}, formError: "No encontramos este comercio." };
  }
  return { fieldErrors: {}, formError: "No pudimos guardar la tarifa. Probá de nuevo en un momento." };
}

export async function saveDeliveryFeeRate(
  organizationId: number,
  form: DeliveryFeeRateForm,
): Promise<DeliveryFeeRateSaveResult> {
  const response = await fetchWithSession(`/organizations/${organizationId}/delivery-fee-rate`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  refresh();
  return { fieldErrors: {}, isSaved: true };
}
