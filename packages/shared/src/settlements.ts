import { z } from "zod";

// El efectivo de un motorista de Volá! pasa por Volá! antes de llegar al comercio;
// el de la flota propia de un comercio va directo al comercio.
export const SettlementType = {
  DriverToPlatform: "driver_to_platform",
  DriverToMerchant: "driver_to_merchant",
  PlatformToMerchant: "platform_to_merchant",
} as const;

export type SettlementType = (typeof SettlementType)[keyof typeof SettlementType];

export const settlementTypeSchema = z.enum(SettlementType);

export const SETTLEMENT_TYPE_LABEL: Record<SettlementType, string> = {
  [SettlementType.DriverToPlatform]: "Motorista a Volá!",
  [SettlementType.DriverToMerchant]: "Motorista al comercio",
  [SettlementType.PlatformToMerchant]: "Volá! al comercio",
};

const cashAmountSchema = z.object({
  orderCount: z.number(),
  amount: z.number(),
});

export type CashAmount = z.infer<typeof cashAmountSchema>;

export const pendingDriverCashSchema = cashAmountSchema.extend({
  driverId: z.number(),
  driverName: z.string(),
  currency: z.string().nullable(),
});

export type PendingDriverCash = z.infer<typeof pendingDriverCashSchema>;

export const pendingMerchantCashSchema = cashAmountSchema.extend({
  organizationId: z.number(),
  organizationName: z.string(),
  currency: z.string().nullable(),
});

export type PendingMerchantCash = z.infer<typeof pendingMerchantCashSchema>;

export const settlementOrderSchema = z.object({
  id: z.number(),
  merchantName: z.string(),
  customerName: z.string(),
  total: z.number(),
  currency: z.string().nullable(),
  deliveredAt: z.string(),
});

export type SettlementOrder = z.infer<typeof settlementOrderSchema>;

export const cashSettlementSchema = z.object({
  id: z.number(),
  type: settlementTypeSchema,
  driverName: z.string().nullable(),
  organizationName: z.string().nullable(),
  settledByName: z.string(),
  orderCount: z.number(),
  amount: z.number(),
  currency: z.string().nullable(),
  createdAt: z.string(),
});

export type CashSettlement = z.infer<typeof cashSettlementSchema>;

// Lo que cobraron motoristas de Volá! en las órdenes de un comercio, según en qué paso va.
export const cashWithPlatformSchema = z.object({
  withDrivers: cashAmountSchema,
  atPlatform: cashAmountSchema,
  settled: cashAmountSchema,
  currency: z.string().nullable(),
});

export type CashWithPlatform = z.infer<typeof cashWithPlatformSchema>;

export const SettlementReceiver = {
  Platform: "platform",
  Merchant: "merchant",
} as const;

export type SettlementReceiver = (typeof SettlementReceiver)[keyof typeof SettlementReceiver];

export const driverPendingCashSchema = cashAmountSchema.extend({
  currency: z.string().nullable(),
  receiver: z.enum(SettlementReceiver),
});

export type DriverPendingCash = z.infer<typeof driverPendingCashSchema>;
