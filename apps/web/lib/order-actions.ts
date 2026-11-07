"use server";

import type { OrderForm } from "@vola/shared";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_BAD_GATEWAY = 502;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface OrderSaveResult {
  fieldErrors: FieldErrors;
  formError?: string;
}

async function toErrorResult(response: Response): Promise<OrderSaveResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
    return { fieldErrors: {}, formError: "Revisá los datos y probá de nuevo." };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { fieldErrors: {}, formError: "No tenés permiso para crear órdenes." };
  }
  if (response.status === HTTP_BAD_GATEWAY) {
    return {
      fieldErrors: {},
      formError: "No pudimos calcular la distancia con Google Maps. Probá de nuevo en un momento.",
    };
  }
  return { fieldErrors: {}, formError: "No pudimos crear la orden. Probá de nuevo en un momento." };
}

export async function createOrder(form: OrderForm): Promise<OrderSaveResult> {
  const response = await fetchWithSession("/orders", {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  redirect("/ordenes");
}
