import { canManageDeliveryFees, type AuthUser } from "@vola/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs, type SectionTab } from "@/components/SectionTabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

type MerchantLayoutProps = LayoutProps<"/organizaciones/[organizationId]/comercios/[merchantId]">;

function getTabs(merchantPath: string, user: AuthUser): SectionTab[] {
  const tabs: SectionTab[] = [{ href: merchantPath, label: "General" }];
  if (canManageDeliveryFees(user)) {
    tabs.push({ href: `${merchantPath}/tarifas`, label: "Tarifas y cobros" });
  }
  return tabs;
}

async function MerchantHeader({ params }: Pick<MerchantLayoutProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const [{ organization, merchant }, currentUser] = await Promise.all([
    getOrganizationMerchant(organizationId, merchantId),
    getCurrentUser(),
  ]);
  const merchantPath = `/organizaciones/${organizationId}/comercios/${merchantId}`;

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/comercios`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {organization.name}
        </Link>
      </Button>
      <PageHeader title={merchant.name} description={organization.name} />
      <SectionTabs label="Secciones del comercio" tabs={getTabs(merchantPath, currentUser)} />
    </div>
  );
}

function MerchantHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-8 w-64 max-w-full" />
    </div>
  );
}

export default function MerchantLayout({ children, params }: MerchantLayoutProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Suspense fallback={<MerchantHeaderSkeleton />}>
        <MerchantHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}
