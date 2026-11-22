"use server";

import {
  invoiceOrderSchema,
  softwareChargeSchema,
  type InvoiceOrder,
  type InvoiceRange,
  type SoftwareChargeDetail,
  type SoftwareInvoiceForm,
} from "@vola/shared";
import { refresh } from "next/cache";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

// Lo que devuelve cada acción: los datos, o los errores para mostrar debajo de cada campo.
export interface InvoiceActionResult<T = undefined> {
  data?: T;
  fieldErrors: FieldErrors;
  formError?: string;
  isDone?: boolean;
}

function toErrorMessage(status: number): string {
  if (status === HTTP_FORBIDDEN) return "No tenés permiso para facturar a comercios.";
  if (status === HTTP_NOT_FOUND) return "No encontramos el contrato de este cliente.";
  if (status === HTTP_CONFLICT) return "No hay órdenes por facturar en esas fechas. Elegí otro rango.";
  return "No pudimos completar la acción. Probá de nuevo en un momento.";
}

async function toErrorResult<T>(response: Response): Promise<InvoiceActionResult<T>> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
  }
  return { fieldErrors: {}, formError: toErrorMessage(response.status) };
}

function toRangeQuery(range: InvoiceRange): string {
  return new URLSearchParams({ from: range.from, to: range.to }).toString();
}

export async function loadPendingInvoiceOrders(
  organizationId: number,
  range: InvoiceRange,
): Promise<InvoiceActionResult<InvoiceOrder[]>> {
  const response = await fetchWithSession(
    `/invoices/pending/${organizationId}/orders?${toRangeQuery(range)}`,
  );
  if (!response.ok) return toErrorResult(response);
  return { data: z.array(invoiceOrderSchema).parse(await response.json()), fieldErrors: {}, isDone: true };
}

export async function createInvoice(
  organizationId: number,
  range: InvoiceRange,
): Promise<InvoiceActionResult> {
  const response = await fetchWithSession(`/invoices/pending/${organizationId}`, {
    method: "POST",
    body: JSON.stringify(range),
  });
  if (!response.ok) return toErrorResult(response);
  refresh();
  return { fieldErrors: {}, isDone: true };
}

export async function loadSoftwareInvoicePreview(
  organizationId: number,
  range: InvoiceRange,
): Promise<InvoiceActionResult<SoftwareChargeDetail>> {
  const response = await fetchWithSession(
    `/invoices/software/pending/${organizationId}/preview?${toRangeQuery(range)}`,
  );
  if (!response.ok) return toErrorResult(response);
  return { data: softwareChargeSchema.parse(await response.json()), fieldErrors: {}, isDone: true };
}

export async function createSoftwareInvoice(
  organizationId: number,
  form: SoftwareInvoiceForm,
): Promise<InvoiceActionResult> {
  const response = await fetchWithSession(`/invoices/software/pending/${organizationId}`, {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);
  refresh();
  return { fieldErrors: {}, isDone: true };
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
