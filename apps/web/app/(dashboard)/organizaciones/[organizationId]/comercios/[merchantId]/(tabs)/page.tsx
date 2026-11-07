import type { Metadata } from "next";
import { Suspense } from "react";
import { MerchantDetailsCard } from "@/components/merchants/MerchantDetailsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Comercio · Volá!" };

type MerchantGeneralPageProps = PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]">;

async function MerchantGeneral({ params }: Pick<MerchantGeneralPageProps, "params">) {
  const routeParams = await params;
  const [{ merchant }, currentUser] = await Promise.all([
    getOrganizationMerchant(
      readIdParam(routeParams.organizationId),
      readIdParam(routeParams.merchantId),
    ),
    getCurrentUser(),
  ]);

  return <MerchantDetailsCard merchant={merchant} currentUser={currentUser} />;
}

export default function MerchantGeneralPage({ params }: MerchantGeneralPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <MerchantGeneral params={params} />
    </Suspense>
  );
}
