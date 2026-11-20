"use server";

import { invoiceOrderSchema, type InvoiceOrder } from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";

const HTTP_FORBIDDEN = 403;
const HTTP_CONFLICT = 409;

export async function loadPendingInvoiceOrders(organizationId: number): Promise<InvoiceOrder[]> {
  const path = `/invoices/pending/${organizationId}/orders`;
  const response = await fetchWithSession(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return z.array(invoiceOrderSchema).parse(await response.json());
}

export interface CreateInvoiceResult {
  error?: string;
  isCreated?: boolean;
}

function toCreateInvoiceError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para facturar a comercios.";
  if (status === HTTP_CONFLICT) return "Ya no hay órdenes por facturar. Otra persona generó la factura mientras tanto.";
  return "No pudimos generar la factura. Probá de nuevo en un momento.";
}

export async function createInvoice(organizationId: number): Promise<CreateInvoiceResult> {
  const response = await fetchWithSession(`/invoices/pending/${organizationId}`, { method: "POST" });
  if (!response.ok) return { error: toCreateInvoiceError(response.status) };
  refresh();
  return { isCreated: true };
}
