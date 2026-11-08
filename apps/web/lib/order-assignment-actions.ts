"use server";

import {
  orderDriverSchema,
  type OrderAssignmentForm,
  type OrderDriver,
} from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface OrderAssignmentResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

function toFormError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para asignar órdenes.";
  if (status === HTTP_CONFLICT) {
    return "Esta orden ya tiene motorista o ya no está Nueva. Recargá la página.";
  }
  return "No pudimos asignar la orden. Probá de nuevo en un momento.";
}

export async function loadOrderDriverOptions(orderId: number): Promise<OrderDriver[]> {
  const response = await fetchWithSession(`/orders/${orderId}/driver-options`);
  if (!response.ok) {
    throw new Error(`GET /orders/${orderId}/driver-options failed with status ${response.status}`);
  }
  return z.array(orderDriverSchema).parse(await response.json());
}

export async function assignOrderDriver(
  orderId: number,
  form: OrderAssignmentForm,
): Promise<OrderAssignmentResult> {
  const response = await fetchWithSession(`/orders/${orderId}/driver`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
  }
  if (!response.ok) return { fieldErrors: {}, formError: toFormError(response.status) };

  refresh();
  return { fieldErrors: {}, isSaved: true };
}
