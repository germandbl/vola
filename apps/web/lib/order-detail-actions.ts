"use server";

import {
  orderDetailSchema,
  type OrderAssignmentForm,
  type OrderCancellationForm,
  type OrderDetail,
  type OrderPreparationForm,
} from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";

const HTTP_NOT_FOUND = 404;

// null cuando la orden no existe o no es de la organización de quien la pide.
export async function loadOrderDetail(orderId: number): Promise<OrderDetail | null> {
  const response = await fetchWithSession(`/orders/${orderId}`);
  if (response.status === HTTP_NOT_FOUND) return null;
  if (!response.ok) {
    throw new Error(`GET /orders/${orderId} failed with status ${response.status}`);
  }
  return orderDetailSchema.parse(await response.json());
}

export interface OrderActionResult {
  order?: OrderDetail;
  error?: string;
}

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

function toActionError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para gestionar esta orden.";
  if (status === HTTP_CONFLICT) return "Esta orden cambió mientras tanto. Cerrá y abrila de nuevo.";
  return "No pudimos guardar el cambio. Probá de nuevo en un momento.";
}

const apiValidationErrorSchema = z.object({
  issues: z.array(z.object({ message: z.string() })).min(1),
});

// Los mensajes de validación del API ya vienen en español y explican qué hacer.
async function readValidationMessage(response: Response): Promise<string | undefined> {
  const body = apiValidationErrorSchema.safeParse(await response.json());
  if (!body.success) return undefined;
  return body.data.issues[0].message;
}

async function sendOrderChange(
  path: string,
  init: { method: "PUT" | "DELETE"; body?: object },
): Promise<OrderActionResult> {
  const response = await fetchWithSession(path, {
    method: init.method,
    body: JSON.stringify(init.body ?? {}),
  });
  if (response.status === HTTP_BAD_REQUEST) {
    const message = await readValidationMessage(response);
    if (message) return { error: message };
  }
  if (!response.ok) return { error: toActionError(response.status) };

  refresh();
  return { order: orderDetailSchema.parse(await response.json()) };
}

export async function changeOrderPreparation(
  orderId: number,
  form: OrderPreparationForm,
): Promise<OrderActionResult> {
  return sendOrderChange(`/orders/${orderId}/preparation`, { method: "PUT", body: form });
}

export async function completeOrder(orderId: number): Promise<OrderActionResult> {
  return sendOrderChange(`/orders/${orderId}/complete`, { method: "PUT" });
}

export async function cancelOrder(
  orderId: number,
  form: OrderCancellationForm,
): Promise<OrderActionResult> {
  return sendOrderChange(`/orders/${orderId}/cancel`, { method: "PUT", body: form });
}

export async function reassignOrderDriver(
  orderId: number,
  form: OrderAssignmentForm,
): Promise<OrderActionResult> {
  return sendOrderChange(`/orders/${orderId}/reassign`, { method: "PUT", body: form });
}

export async function releaseOrderDriver(orderId: number): Promise<OrderActionResult> {
  return sendOrderChange(`/orders/${orderId}/driver`, { method: "DELETE" });
}
