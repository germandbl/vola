import { z } from "zod";

// Volá! le factura a cada comercio el envío de las órdenes que entregaron sus motoristas.
export const pendingInvoiceSchema = z.object({
  organizationId: z.number(),
  organizationName: z.string(),
  currency: z.string().nullable(),
  orderCount: z.number(),
  amount: z.number(),
});

export type PendingInvoice = z.infer<typeof pendingInvoiceSchema>;

export const invoiceOrderSchema = z.object({
  id: z.number(),
  merchantName: z.string(),
  customerName: z.string(),
  deliveryFee: z.number(),
  currency: z.string().nullable(),
  deliveredAt: z.string(),
});

export type InvoiceOrder = z.infer<typeof invoiceOrderSchema>;

export const invoiceSummarySchema = z.object({
  id: z.number(),
  organizationName: z.string(),
  createdByName: z.string(),
  orderCount: z.number(),
  amount: z.number(),
  currency: z.string().nullable(),
  createdAt: z.string(),
});

export type InvoiceSummary = z.infer<typeof invoiceSummarySchema>;
