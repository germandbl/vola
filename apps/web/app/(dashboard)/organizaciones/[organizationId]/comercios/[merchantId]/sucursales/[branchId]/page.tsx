import { canManageAllMerchants } from "@vola/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { BranchDetailsCard } from "@/components/branches/BranchDetailsCard";
import { BranchForm } from "@/components/branches/BranchForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateBranch } from "@/lib/branch-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getBranch, getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Sucursal · Volá!" };

type BranchPageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/sucursales/[branchId]">;

async function BranchContent({ params }: Pick<BranchPageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const branchId = readIdParam(routeParams.branchId);
  const [{ merchant }, branch, currentUser] = await Promise.all([
    getOrganizationMerchant(organizationId, merchantId),
    getBranch(branchId),
    getCurrentUser(),
  ]);
  // La URL trae el comercio; si la sucursal es de otro, la ruta no existe.
  if (branch.merchantId !== merchant.id) notFound();

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/comercios/${merchantId}/sucursales`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {merchant.name}
        </Link>
      </Button>
      <PageHeader title={branch.name} description={merchant.name} />
      {canManageAllMerchants(currentUser) ? (
        <Card>
          <CardContent>
            <BranchForm
              save={updateBranch.bind(null, branchId)}
              initialLocation={{ latitude: branch.latitude, longitude: branch.longitude }}
              branch={branch}
              submitLabel="Guardar cambios"
              pendingLabel="Guardando…"
            />
          </CardContent>
        </Card>
      ) : (
        <BranchDetailsCard branch={branch} />
      )}
    </>
  );
}

export default function BranchPage({ params }: BranchPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <BranchContent params={params} />
      </Suspense>
    </div>
  );
}
