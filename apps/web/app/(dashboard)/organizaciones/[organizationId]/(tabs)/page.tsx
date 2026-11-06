import { RoleName } from "@vola/shared";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EditOrganizationCard } from "@/components/organizations/EditOrganizationCard";
import { OrganizationInfoCard } from "@/components/organizations/OrganizationInfoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Organización · Volá!" };

type OrganizationGeneralPageProps = PageProps<"/organizaciones/[organizationId]">;

async function OrganizationGeneral({ params }: Pick<OrganizationGeneralPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const [organization, currentUser] = await Promise.all([
    getOrganization(organizationId),
    getCurrentUser(),
  ]);

  if (currentUser.role === RoleName.Superadmin) {
    return <EditOrganizationCard organization={organization} />;
  }
  return <OrganizationInfoCard organization={organization} />;
}

export default function OrganizationGeneralPage({ params }: OrganizationGeneralPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <OrganizationGeneral params={params} />
    </Suspense>
  );
}
