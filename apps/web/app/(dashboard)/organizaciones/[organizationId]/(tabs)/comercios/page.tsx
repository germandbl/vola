import { canManageMerchants } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { MerchantsTable } from "@/components/merchants/MerchantsTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Comercios · Volá!" };

type OrganizationMerchantsPageProps = PageProps<"/organizaciones/[organizationId]/comercios">;

async function OrganizationMerchants({ params }: Pick<OrganizationMerchantsPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const currentUser = await getCurrentUser();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Comercios</h2>
        {canManageMerchants(currentUser) && (
          <Button asChild>
            <Link href={`/organizaciones/${organizationId}/comercios/nuevo`}>
              <Plus data-icon="inline-start" />
              Crear comercio
            </Link>
          </Button>
        )}
      </div>
      <MerchantsTable organizationId={organizationId} />
    </section>
  );
}

export default function OrganizationMerchantsPage({ params }: OrganizationMerchantsPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrganizationMerchants params={params} />
    </Suspense>
  );
}
