import { z } from "zod";
import { billingPeriodSchema, contractCurrencySchema } from "./software-contracts.js";

// Volá! factura dos cosas: el envío de las órdenes de sus motoristas y el uso del software por contrato.
export const InvoiceType = {
  Delivery: "delivery",
  Software: "software",
} as const;

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];

export const invoiceTypeSchema = z.enum(InvoiceType);

export const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  [InvoiceType.Delivery]: "Envíos",
  [InvoiceType.Software]: "Uso del software",
};

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
  type: invoiceTypeSchema,
  // El mes facturado, solo en las de software.
  period: z.string().nullable(),
  organizationName: z.string(),
  createdByName: z.string(),
  orderCount: z.number(),
  amount: z.number(),
  currency: z.string().nullable(),
  createdAt: z.string(),
  // null mientras el comercio no la ha pagado.
  paidAt: z.string().nullable(),
});

export type InvoiceSummary = z.infer<typeof invoiceSummarySchema>;

// Con qué condiciones del contrato y qué tasa de cambio se calculó una factura de software.
export const softwareInvoiceBreakdownSchema = z.object({
  contractCurrency: contractCurrencySchema,
  monthlyFee: z.number(),
  includedOrders: z.number(),
  extraOrderFee: z.number(),
  orderCount: z.number(),
  extraOrderCount: z.number(),
  subtotal: z.number(),
  exchangeRate: z.number(),
});

export type SoftwareInvoiceBreakdown = z.infer<typeof softwareInvoiceBreakdownSchema>;

export const invoiceDetailSchema = invoiceSummarySchema.extend({
  paidByName: z.string().nullable(),
  orders: z.array(invoiceOrderSchema),
  software: softwareInvoiceBreakdownSchema.nullable(),
});

export type InvoiceDetail = z.infer<typeof invoiceDetailSchema>;

// Un mes cerrado de un contrato que todavía no se factura.
export const pendingSoftwareInvoiceSchema = softwareInvoiceBreakdownSchema
  .omit({ exchangeRate: true })
  .extend({
    organizationId: z.number(),
    organizationName: z.string(),
    period: z.string(),
    // La moneda del país del cliente; la factura queda en esta moneda.
    invoiceCurrency: z.string(),
  });

export type PendingSoftwareInvoice = z.infer<typeof pendingSoftwareInvoiceSchema>;

const MAX_EXCHANGE_RATE = 1_000_000;

export const softwareInvoiceFormSchema = z.object({
  period: billingPeriodSchema,
  // null cuando el contrato está en la misma moneda del país del cliente.
  exchangeRate: z
    .number({ error: "Escribí la tasa de cambio." })
    .positive("La tasa de cambio tiene que ser mayor que 0.")
    .max(MAX_EXCHANGE_RATE, `La tasa de cambio no puede pasar de ${MAX_EXCHANGE_RATE}.`)
    .nullable(),
});

export type SoftwareInvoiceForm = z.infer<typeof softwareInvoiceFormSchema>;
