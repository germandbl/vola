"use server";

import { orderDetailSchema, type OrderDetail } from "@vola/shared";
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
