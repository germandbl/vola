import type { DriverMerchant } from "@vola/shared";

export interface OrganizationGroup {
  organizationId: number;
  organizationName: string;
  merchants: DriverMerchant[];
}

export function groupByOrganization(merchants: DriverMerchant[]): OrganizationGroup[] {
  const groups = new Map<number, OrganizationGroup>();
  for (const merchant of merchants) {
    const group = groups.get(merchant.organizationId) ?? {
      organizationId: merchant.organizationId,
      organizationName: merchant.organizationName,
      merchants: [],
    };
    group.merchants.push(merchant);
    groups.set(merchant.organizationId, group);
  }
  return [...groups.values()];
}
