import {
  driverOrderDetailSchema,
  driverOrderSchema,
  type DriverOrder,
  type DriverOrderDetail,
  type OrderStatusChangeForm,
} from "@vola/shared";
import { z } from "zod";
import { fetchApi } from "./api";

const HTTP_CONFLICT = 409;

// La orden cambió en otro lado (por ejemplo, el comercio la canceló) antes de este cambio.
export class OrderStatusConflictError extends Error {}

export async function requestAssignedOrders(token: string): Promise<DriverOrder[]> {
  const response = await fetchApi("/orders/assigned-to-me", { token });
  if (!response.ok) {
    throw new Error(`GET /orders/assigned-to-me failed with status ${response.status}`);
  }
  return z.array(driverOrderSchema).parse(await response.json());
}

export async function requestOrderDetail(token: string, orderId: number): Promise<DriverOrderDetail> {
  const response = await fetchApi(`/orders/assigned-to-me/${orderId}`, { token });
  if (!response.ok) {
    throw new Error(`GET /orders/assigned-to-me/${orderId} failed with status ${response.status}`);
  }
  return driverOrderDetailSchema.parse(await response.json());
}

export async function requestStatusChange(
  token: string,
  orderId: number,
  form: OrderStatusChangeForm,
): Promise<DriverOrderDetail> {
  const response = await fetchApi(`/orders/${orderId}/status`, {
    method: "PUT",
    token,
    body: form,
  });
  if (response.status === HTTP_CONFLICT) throw new OrderStatusConflictError();
  if (!response.ok) {
    throw new Error(`PUT /orders/${orderId}/status failed with status ${response.status}`);
  }
  return driverOrderDetailSchema.parse(await response.json());
}
