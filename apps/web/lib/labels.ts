import { DayOfWeek, INVOICE_TYPE_LABEL, OrganizationType, RoleName, type InvoiceSummary } from "@vola/shared";

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

const periodFormatter = new Intl.DateTimeFormat("es-HN", { month: "long", year: "numeric", timeZone: "UTC" });

// "2026-09" → "septiembre de 2026".
export function formatPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return periodFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

// Las de software dicen qué mes cobran: "Uso del software · septiembre de 2026".
export function describeInvoiceConcept(invoice: Pick<InvoiceSummary, "type" | "period">): string {
  const typeLabel = INVOICE_TYPE_LABEL[invoice.type];
  if (!invoice.period) return typeLabel;
  return `${typeLabel} · ${formatPeriod(invoice.period)}`;
}
