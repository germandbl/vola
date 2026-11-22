import { z } from "zod";

// Las monedas de los países donde operamos; el dólar también sirve para contratos regionales.
export const ContractCurrency = {
  USD: "USD",
  GTQ: "GTQ",
  HNL: "HNL",
  NIO: "NIO",
  CRC: "CRC",
  BZD: "BZD",
} as const;

export type ContractCurrency = (typeof ContractCurrency)[keyof typeof ContractCurrency];

export const contractCurrencySchema = z.enum(ContractCurrency, {
  error: "Elegí la moneda del contrato.",
});

export const CONTRACT_CURRENCY_LABEL: Record<ContractCurrency, string> = {
  [ContractCurrency.USD]: "Dólar estadounidense (USD)",
  [ContractCurrency.GTQ]: "Quetzal (GTQ)",
  [ContractCurrency.HNL]: "Lempira (HNL)",
  [ContractCurrency.NIO]: "Córdoba (NIO)",
  [ContractCurrency.CRC]: "Colón costarricense (CRC)",
  [ContractCurrency.BZD]: "Dólar beliceño (BZD)",
};

const MAX_CONTRACT_AMOUNT = 10_000_000;
const MAX_INCLUDED_ORDERS = 1_000_000;
const HUNDREDTH = 0.01;
const HUNDREDTHS_PER_UNIT = 100;

// Un mes se escribe como "2026-11", igual que el valor de un <input type="month">.
export const billingPeriodSchema = z
  .string({ error: "Elegí el mes." })
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Elegí un mes válido.");

const contractAmountSchema = z
  .number({ error: "Escribí un monto." })
  .nonnegative("El monto no puede ser negativo.")
  .max(MAX_CONTRACT_AMOUNT, `El monto no puede pasar de ${MAX_CONTRACT_AMOUNT}.`)
  .multipleOf(HUNDREDTH, "Usá hasta dos decimales.");

export const softwareContractFormSchema = z.object({
  currency: contractCurrencySchema,
  startPeriod: billingPeriodSchema,
  monthlyFee: contractAmountSchema,
  includedOrders: z
    .number({ error: "Escribí cuántas órdenes incluye." })
    .int("Usá un número entero de órdenes.")
    .nonnegative("No puede ser negativo. Usá 0 si no incluye órdenes.")
    .max(MAX_INCLUDED_ORDERS, `No puede pasar de ${MAX_INCLUDED_ORDERS} órdenes.`),
  extraOrderFee: contractAmountSchema,
});

export type SoftwareContractForm = z.infer<typeof softwareContractFormSchema>;

export const softwareContractSchema = softwareContractFormSchema.extend({
  updatedAt: z.string(),
});

export type SoftwareContract = z.infer<typeof softwareContractSchema>;

export const softwareContractSettingSchema = z.object({
  contract: softwareContractSchema.nullable(),
});

export type SoftwareContractSetting = z.infer<typeof softwareContractSettingSchema>;

function roundToHundredths(amount: number): number {
  return Math.round(amount * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
}

export interface SoftwareCharge {
  extraOrderCount: number;
  subtotal: number;
}

type SoftwareContractTerms = Pick<SoftwareContract, "monthlyFee" | "includedOrders" | "extraOrderFee">;

// El costo mensual cubre las órdenes incluidas; cada orden de más se cobra aparte.
export function calculateSoftwareCharge(
  contract: SoftwareContractTerms,
  orderCount: number,
): SoftwareCharge {
  const extraOrderCount = Math.max(0, orderCount - contract.includedOrders);
  const extraOrdersAmount = extraOrderCount * contract.extraOrderFee;
  return {
    extraOrderCount,
    subtotal: roundToHundredths(contract.monthlyFee + extraOrdersAmount),
  };
}

export function convertWithExchangeRate(amount: number, exchangeRate: number): number {
  return roundToHundredths(amount * exchangeRate);
}
