import { z } from "zod";
import { contractCurrencySchema } from "./software-contracts.js";

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

export const invoiceOrderSchema = z.object({
  id: z.number(),
  merchantName: z.string(),
  customerName: z.string(),
  deliveryFee: z.number(),
  currency: z.string().nullable(),
  deliveredAt: z.string(),
});

export type InvoiceOrder = z.infer<typeof invoiceOrderSchema>;

// Un día se escribe como "2026-11-15", igual que el valor de un <input type="date">.
export const billingDateSchema = z
  .string({ error: "Elegí una fecha." })
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Elegí una fecha válida.");

const invoiceRangeFields = { from: billingDateSchema, to: billingDateSchema };

function isRangeInOrder(range: { from: string; to: string }): boolean {
  return range.from <= range.to;
}

const RANGE_ORDER_ERROR = {
  message: "La fecha final tiene que ser igual o después de la inicial.",
  path: ["to"],
};

// Días completos en la hora de la región, incluyendo el primero y el último.
export const invoiceRangeSchema = z.object(invoiceRangeFields).refine(isRangeInOrder, RANGE_ORDER_ERROR);

export type InvoiceRange = z.infer<typeof invoiceRangeSchema>;

export const invoiceSummarySchema = z.object({
  id: z.number(),
  type: invoiceTypeSchema,
  periodStart: z.string(),
  periodEnd: z.string(),
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

// Lo que se cobra por el uso del software en un rango, en la moneda del contrato.
export const softwareChargeSchema = z.object({
  contractCurrency: contractCurrencySchema,
  monthlyFee: z.number(),
  includedOrders: z.number(),
  extraOrderFee: z.number(),
  // Cuántos meses cubre el rango: 15 días de un mes de 30 = 0.5.
  monthFraction: z.number(),
  proratedMonthlyFee: z.number(),
  proratedIncludedOrders: z.number(),
  orderCount: z.number(),
  extraOrderCount: z.number(),
  subtotal: z.number(),
});

export type SoftwareChargeDetail = z.infer<typeof softwareChargeSchema>;

export const softwareInvoiceBreakdownSchema = softwareChargeSchema.extend({
  exchangeRate: z.number(),
});

export type SoftwareInvoiceBreakdown = z.infer<typeof softwareInvoiceBreakdownSchema>;

export const invoiceDetailSchema = invoiceSummarySchema.extend({
  paidByName: z.string().nullable(),
  orders: z.array(invoiceOrderSchema),
  software: softwareInvoiceBreakdownSchema.nullable(),
});

export type InvoiceDetail = z.infer<typeof invoiceDetailSchema>;

// Un cliente con envíos de Volá! sin facturar, con las fechas sugeridas para el rango.
export const pendingInvoiceSchema = z.object({
  organizationId: z.number(),
  organizationName: z.string(),
  currency: z.string().nullable(),
  orderCount: z.number(),
  amount: z.number(),
  firstDeliveryDate: z.string(),
  lastBillableDate: z.string(),
});

export type PendingInvoice = z.infer<typeof pendingInvoiceSchema>;

// Un cliente con contrato que tiene días sin facturar desde nextPeriodStart.
export const pendingSoftwareInvoiceSchema = z.object({
  organizationId: z.number(),
  organizationName: z.string(),
  contractCurrency: contractCurrencySchema,
  // La moneda del país del cliente; la factura queda en esta moneda.
  invoiceCurrency: z.string(),
  monthlyFee: z.number(),
  includedOrders: z.number(),
  extraOrderFee: z.number(),
  nextPeriodStart: z.string(),
  lastBillableDate: z.string(),
});

export type PendingSoftwareInvoice = z.infer<typeof pendingSoftwareInvoiceSchema>;

const MAX_EXCHANGE_RATE = 1_000_000;

export const softwareInvoiceFormSchema = z
  .object({
    ...invoiceRangeFields,
    // null cuando el contrato está en la misma moneda del país del cliente.
    exchangeRate: z
      .number({ error: "Escribí la tasa de cambio." })
      .positive("La tasa de cambio tiene que ser mayor que 0.")
      .max(MAX_EXCHANGE_RATE, `La tasa de cambio no puede pasar de ${MAX_EXCHANGE_RATE}.`)
      .nullable(),
  })
  .refine(isRangeInOrder, RANGE_ORDER_ERROR);

export type SoftwareInvoiceForm = z.infer<typeof softwareInvoiceFormSchema>;
