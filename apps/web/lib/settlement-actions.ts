"use server";

import { settlementOrderSchema, type SettlementOrder } from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";

const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

async function loadSettlementOrders(path: string): Promise<SettlementOrder[]> {
  const response = await fetchWithSession(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return z.array(settlementOrderSchema).parse(await response.json());
}

export async function loadDriverSettlementOrders(driverId: number): Promise<SettlementOrder[]> {
  return loadSettlementOrders(`/settlements/drivers/${driverId}/orders`);
}

export async function loadMerchantSettlementOrders(
  organizationId: number,
): Promise<SettlementOrder[]> {
  return loadSettlementOrders(`/settlements/merchants/${organizationId}/orders`);
}

export interface SettleCashResult {
  error?: string;
  isSettled?: boolean;
}

function toSettleError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para liquidar efectivo.";
  if (status === HTTP_CONFLICT) return "Ya no hay efectivo pendiente. Otra persona lo liquidó mientras tanto.";
  return "No pudimos registrar la liquidación. Probá de nuevo en un momento.";
}

async function settleCash(path: string): Promise<SettleCashResult> {
  const response = await fetchWithSession(path, { method: "POST" });
  if (!response.ok) return { error: toSettleError(response.status) };
  refresh();
  return { isSettled: true };
}

export async function settleDriverCash(driverId: number): Promise<SettleCashResult> {
  return settleCash(`/settlements/drivers/${driverId}`);
}

export async function settleMerchantCash(organizationId: number): Promise<SettleCashResult> {
  return settleCash(`/settlements/merchants/${organizationId}`);
}
