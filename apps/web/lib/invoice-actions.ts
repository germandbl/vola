"use server";

import { invoiceOrderSchema, type InvoiceOrder, type SoftwareInvoiceForm } from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
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

export interface MarkInvoicePaidResult {
  error?: string;
  isPaid?: boolean;
}

function toMarkPaidError(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para registrar pagos de facturas.";
  if (status === HTTP_CONFLICT) return "Esta factura ya estaba pagada. Otra persona registró el pago.";
  return "No pudimos registrar el pago. Probá de nuevo en un momento.";
}

export async function markInvoicePaid(invoiceId: number): Promise<MarkInvoicePaidResult> {
  const response = await fetchWithSession(`/invoices/${invoiceId}/payment`, { method: "POST" });
  if (!response.ok) return { error: toMarkPaidError(response.status) };
  refresh();
  return { isPaid: true };
}

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface CreateSoftwareInvoiceResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isCreated?: boolean;
}

async function toSoftwareInvoiceError(response: Response): Promise<CreateSoftwareInvoiceResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
  }
  if (response.status === HTTP_CONFLICT) {
    return { fieldErrors: {}, formError: "Ese mes ya se facturó. Otra persona generó la factura mientras tanto." };
  }
  return { fieldErrors: {}, formError: toCreateInvoiceError(response.status) };
}

export async function createSoftwareInvoice(
  organizationId: number,
  form: SoftwareInvoiceForm,
): Promise<CreateSoftwareInvoiceResult> {
  const response = await fetchWithSession(`/invoices/software/pending/${organizationId}`, {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toSoftwareInvoiceError(response);
  refresh();
  return { fieldErrors: {}, isCreated: true };
}
