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

// El mes desde el que rige el contrato se escribe como "2026-11", igual que un <input type="month">.
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

const MILLIONTHS_PER_UNIT = 1_000_000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function countDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MILLISECONDS_PER_DAY) + 1;
}

// Cuántos meses cubre un rango de días, sumando la parte de cada mes: del 1 al 15 de noviembre = 15/30 = 0.5.
export function calculateMonthFraction(from: string, to: string): number {
  const rangeStart = parseDate(from);
  const rangeEnd = parseDate(to);
  let fraction = 0;
  let monthStart = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), 1));
  while (monthStart <= rangeEnd) {
    const nextMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    const monthEnd = new Date(nextMonthStart.getTime() - MILLISECONDS_PER_DAY);
    const overlapStart = rangeStart > monthStart ? rangeStart : monthStart;
    const overlapEnd = rangeEnd < monthEnd ? rangeEnd : monthEnd;
    fraction += countDays(overlapStart, overlapEnd) / countDays(monthStart, monthEnd);
    monthStart = nextMonthStart;
  }
  return Math.round(fraction * MILLIONTHS_PER_UNIT) / MILLIONTHS_PER_UNIT;
}

export interface SoftwareCharge {
  proratedMonthlyFee: number;
  proratedIncludedOrders: number;
  extraOrderCount: number;
  subtotal: number;
}

type SoftwareContractTerms = Pick<SoftwareContract, "monthlyFee" | "includedOrders" | "extraOrderFee">;

// El costo mensual y las órdenes incluidas se prorratean por los meses que cubre el rango;
// las órdenes incluidas se redondean hacia abajo para no regalar una orden.
export function calculateSoftwareCharge(
  contract: SoftwareContractTerms,
  orderCount: number,
  monthFraction: number,
): SoftwareCharge {
  const proratedMonthlyFee = roundToHundredths(contract.monthlyFee * monthFraction);
  const proratedIncludedOrders = Math.floor(contract.includedOrders * monthFraction);
  const extraOrderCount = Math.max(0, orderCount - proratedIncludedOrders);
  const extraOrdersAmount = extraOrderCount * contract.extraOrderFee;
  return {
    proratedMonthlyFee,
    proratedIncludedOrders,
    extraOrderCount,
    subtotal: roundToHundredths(proratedMonthlyFee + extraOrdersAmount),
  };
}

export function convertWithExchangeRate(amount: number, exchangeRate: number): number {
  return roundToHundredths(amount * exchangeRate);
}
