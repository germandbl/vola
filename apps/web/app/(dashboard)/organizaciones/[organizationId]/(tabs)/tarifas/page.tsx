import { OrganizationType, canManageDeliveryFees } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeliveryFeeRateCard } from "@/components/delivery-fees/DeliveryFeeRateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Tarifas y cobros · Volá!" };

type OrganizationRatesPageProps = PageProps<"/organizaciones/[organizationId]/tarifas">;

async function OrganizationRates({ params }: Pick<OrganizationRatesPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const [organization, currentUser] = await Promise.all([
    getOrganization(organizationId),
    getCurrentUser(),
  ]);
  if (organization.type !== OrganizationType.Merchant) notFound();
  if (!canManageDeliveryFees(currentUser)) notFound();

  return <DeliveryFeeRateCard organization={organization} />;
}

export default function OrganizationRatesPage({ params }: OrganizationRatesPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <OrganizationRates params={params} />
    </Suspense>
  );
}
