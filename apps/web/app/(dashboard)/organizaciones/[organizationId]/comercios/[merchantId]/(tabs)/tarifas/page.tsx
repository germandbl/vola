import { canManageDeliveryFees } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MerchantFeesSection } from "@/components/merchants/MerchantFeesSection";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Tarifas y cobros · Volá!" };

type MerchantRatesPageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/tarifas">;

async function MerchantRates({ params }: Pick<MerchantRatesPageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const [{ organization }, currentUser] = await Promise.all([
    getOrganizationMerchant(organizationId, merchantId),
    getCurrentUser(),
  ]);
  if (!canManageDeliveryFees(currentUser)) notFound();

  return (
    <MerchantFeesSection
      merchantPath={`/organizaciones/${organizationId}/comercios/${merchantId}`}
      merchantId={merchantId}
      currency={organization.countryCurrency}
    />
  );
}

export default function MerchantRatesPage({ params }: MerchantRatesPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MerchantRates params={params} />
    </Suspense>
  );
}
