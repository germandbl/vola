const MONEY_DECIMALS = 2;

export function formatMoney(amount: number, currency: string | null): string {
  if (!currency) return amount.toFixed(MONEY_DECIMALS);
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
