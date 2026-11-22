import { DayOfWeek, OrganizationType, RoleName } from "@vola/shared";

export const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  [OrganizationType.Merchant]: "Cliente",
  [OrganizationType.Platform]: "Plataforma",
};

export const DAY_OF_WEEK_LABEL: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: "Lunes",
  [DayOfWeek.Tuesday]: "Martes",
  [DayOfWeek.Wednesday]: "Miércoles",
  [DayOfWeek.Thursday]: "Jueves",
  [DayOfWeek.Friday]: "Viernes",
  [DayOfWeek.Saturday]: "Sábado",
  [DayOfWeek.Sunday]: "Domingo",
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

const dateTimeFormatter = new Intl.DateTimeFormat("es-HN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
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

export function formatOrderCount(orderCount: number): string {
  if (orderCount === 1) return "1 orden";
  return `${orderCount} órdenes`;
}

const timeFormatter = new Intl.DateTimeFormat("es-HN", { timeStyle: "short" });

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

const billingDateFormatter = new Intl.DateTimeFormat("es-HN", { dateStyle: "medium", timeZone: "UTC" });

// Las fechas de facturación son días ("2026-11-15"), sin hora: se formatean en UTC para que no cambie el día.
export function formatBillingDate(date: string): string {
  return billingDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function formatDateRange(from: string, to: string): string {
  if (from === to) return formatBillingDate(from);
  return `${formatBillingDate(from)} – ${formatBillingDate(to)}`;
}

const monthFractionFormatter = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 2 });

export function formatMonthFraction(monthFraction: number): string {
  if (monthFraction === 1) return "1 mes";
  return `${monthFractionFormatter.format(monthFraction)} meses`;
}
