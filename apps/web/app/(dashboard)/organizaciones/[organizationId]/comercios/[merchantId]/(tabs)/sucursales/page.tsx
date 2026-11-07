import { canManageMerchants } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { BranchesTable } from "@/components/branches/BranchesTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Sucursales · Volá!" };

type MerchantBranchesPageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/sucursales">;

async function MerchantBranches({ params }: Pick<MerchantBranchesPageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const currentUser = await getCurrentUser();
  const merchantPath = `/organizaciones/${organizationId}/comercios/${merchantId}`;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Sucursales</h2>
        {canManageMerchants(currentUser) && (
          <Button asChild>
            <Link href={`${merchantPath}/sucursales/nueva`}>
              <Plus data-icon="inline-start" />
              Crear sucursal
            </Link>
          </Button>
        )}
      </div>
      <BranchesTable merchantPath={merchantPath} merchantId={merchantId} />
    </section>
  );
}

export default function MerchantBranchesPage({ params }: MerchantBranchesPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MerchantBranches params={params} />
    </Suspense>
  );
}
