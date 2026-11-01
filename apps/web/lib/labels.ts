import { OrganizationType, RoleName } from "@vola/shared";

export const ORGANIZATION_TYPE_LABEL: Record<OrganizationType, string> = {
  [OrganizationType.Merchant]: "Comercio",
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
