import { driverOrderSchema, type DriverOrder } from "@vola/shared";
import { z } from "zod";
import { fetchApi } from "./api";

export async function requestAssignedOrders(token: string): Promise<DriverOrder[]> {
  const response = await fetchApi("/orders/assigned-to-me", { token });
  if (!response.ok) {
    throw new Error(`GET /orders/assigned-to-me failed with status ${response.status}`);
  }
  return z.array(driverOrderSchema).parse(await response.json());
}
