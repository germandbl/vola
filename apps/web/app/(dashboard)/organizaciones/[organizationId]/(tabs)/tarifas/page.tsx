import { DeliveryFeeBasis, OrganizationType, canManageDeliveryFees } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeliveryFeeBasisCard } from "@/components/delivery-fees/DeliveryFeeBasisCard";
import { DeliveryFeeRateCard } from "@/components/delivery-fees/DeliveryFeeRateCard";
import { OrderCountFeeRateCard } from "@/components/delivery-fees/OrderCountFeeRateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import {
  getDeliveryFeeBasis,
  getDeliveryFeeRate,
  getOrderCountFeeRate,
  getOrganization,
} from "@/lib/organizations-data";
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

  const [{ basis }, distanceRate, orderCountRate] = await Promise.all([
    getDeliveryFeeBasis(organizationId),
    getDeliveryFeeRate(organizationId),
    getOrderCountFeeRate(organizationId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <DeliveryFeeBasisCard
        organizationId={organizationId}
        initialBasis={basis}
        hasDistanceRate={distanceRate.ranges.length > 0}
        hasOrderCountRate={orderCountRate.ranges.length > 0}
      />
      <DeliveryFeeRateCard
        organization={organization}
        rate={distanceRate}
        isActive={basis === DeliveryFeeBasis.Distance}
      />
      <OrderCountFeeRateCard
        organization={organization}
        rate={orderCountRate}
        isActive={basis === DeliveryFeeBasis.CompletedOrders}
      />
    </div>
  );
}

export default function OrganizationRatesPage({ params }: OrganizationRatesPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <OrganizationRates params={params} />
    </Suspense>
  );
}
