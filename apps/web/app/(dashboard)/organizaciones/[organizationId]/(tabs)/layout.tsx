import {
  OrganizationType,
  canManageDeliveryFees,
  type AuthUser,
  type Organization,
} from "@vola/shared";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OrganizationTabs, type OrganizationTab } from "@/components/organizations/OrganizationTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { ORGANIZATION_TYPE_LABEL } from "@/lib/labels";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

type OrganizationLayoutProps = LayoutProps<"/organizaciones/[organizationId]">;

function getTabs(organization: Organization, user: AuthUser): OrganizationTab[] {
  const basePath = `/organizaciones/${organization.id}`;
  const tabs: OrganizationTab[] = [
    { href: basePath, label: "General" },
    { href: `${basePath}/usuarios`, label: "Usuarios y permisos" },
  ];
  if (organization.type === OrganizationType.Merchant && canManageDeliveryFees(user)) {
    tabs.push({ href: `${basePath}/tarifas`, label: "Tarifas y cobros" });
  }
  return tabs;
}

async function OrganizationHeader({ params }: Pick<OrganizationLayoutProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const [organization, currentUser] = await Promise.all([
    getOrganization(organizationId),
    getCurrentUser(),
  ]);
  const countryLabel = organization.countryName ?? "Sin país";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={organization.name}
        description={`${ORGANIZATION_TYPE_LABEL[organization.type]} · ${countryLabel}`}
      />
      <OrganizationTabs tabs={getTabs(organization, currentUser)} />
    </div>
  );
}

function OrganizationHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-96 max-w-full" />
    </div>
  );
}

export default function OrganizationLayout({ children, params }: OrganizationLayoutProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Suspense fallback={<OrganizationHeaderSkeleton />}>
        <OrganizationHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}
