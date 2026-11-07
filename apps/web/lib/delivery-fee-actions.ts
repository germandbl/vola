"use server";

import type {
  DeliveryFeeBasisForm,
  DeliveryFeeRateForm,
  OrderCountFeeRateForm,
} from "@vola/shared";
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

export interface DeliveryFeeSaveResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

async function toErrorResult(response: Response): Promise<DeliveryFeeSaveResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
    return { fieldErrors: {}, formError: "Revisá los datos y probá de nuevo." };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { fieldErrors: {}, formError: "No tenés permiso para cambiar tarifas de envío." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { fieldErrors: {}, formError: "No encontramos este comercio." };
  }
  return { fieldErrors: {}, formError: "No pudimos guardar. Probá de nuevo en un momento." };
}

async function saveToApi(path: string, body: unknown): Promise<DeliveryFeeSaveResult> {
  const response = await fetchWithSession(path, { method: "PUT", body: JSON.stringify(body) });
  if (!response.ok) return toErrorResult(response);

  refresh();
  return { fieldErrors: {}, isSaved: true };
}

export async function saveDeliveryFeeRate(
  merchantId: number,
  form: DeliveryFeeRateForm,
): Promise<DeliveryFeeSaveResult> {
  return saveToApi(`/merchants/${merchantId}/delivery-fee-rate`, form);
}

export async function saveOrderCountFeeRate(
  merchantId: number,
  form: OrderCountFeeRateForm,
): Promise<DeliveryFeeSaveResult> {
  return saveToApi(`/merchants/${merchantId}/order-count-fee-rate`, form);
}

export async function saveDeliveryFeeBasis(
  merchantId: number,
  form: DeliveryFeeBasisForm,
): Promise<DeliveryFeeSaveResult> {
  return saveToApi(`/merchants/${merchantId}/delivery-fee-basis`, form);
}
