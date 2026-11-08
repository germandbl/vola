"use server";

import {
  orderDetailSchema,
  type OrderDetail,
  type OrderPreparationForm,
} from "@vola/shared";
import { refresh } from "next/cache";
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

const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

function toActionError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para gestionar esta orden.";
  if (status === HTTP_CONFLICT) return "Esta orden cambió mientras tanto. Cerrá y abrila de nuevo.";
  return "No pudimos guardar el cambio. Probá de nuevo en un momento.";
}

export async function changeOrderPreparation(
  orderId: number,
  form: OrderPreparationForm,
): Promise<OrderActionResult> {
  const response = await fetchWithSession(`/orders/${orderId}/preparation`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  if (!response.ok) return { error: toActionError(response.status) };

  refresh();
  return { order: orderDetailSchema.parse(await response.json()) };
}
