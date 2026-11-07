import { OrganizationType, RoleName } from "@vola/shared";

export const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  [OrganizationType.Merchant]: "Cliente",
  [OrganizationType.Platform]: "Plataforma",
};

export const ROLE_LABEL: Record<RoleName, string> = {
  [RoleName.Superadmin]: "Superadmin",
  [RoleName.Administrator]: "Administrador",
  [RoleName.Agent]: "Agente",
  [RoleName.Driver]: "Motorista",
};

const dateFormatter = new Intl.DateTimeFormat("es-HN", { dateStyle: "medium" });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatMoney(amount: number, currency: string | null): string {
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? currency;
}
