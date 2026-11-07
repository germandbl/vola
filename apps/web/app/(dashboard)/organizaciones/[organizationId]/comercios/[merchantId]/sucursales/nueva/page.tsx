import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { BranchForm } from "@/components/branches/BranchForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createBranch } from "@/lib/branch-actions";
import { getDefaultMapCenter } from "@/lib/map-defaults";
import { getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Crear sucursal · Volá!" };

type NewBranchPageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/sucursales/nueva">;

async function NewBranchContent({ params }: Pick<NewBranchPageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const { organization, merchant } = await getOrganizationMerchant(organizationId, merchantId);

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/comercios/${merchantId}/sucursales`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {merchant.name}
        </Link>
      </Button>
      <PageHeader title="Crear sucursal" description={merchant.name} />
      <Card>
        <CardContent>
          <BranchForm
            save={createBranch.bind(null, organizationId, merchantId)}
            initialLocation={getDefaultMapCenter(organization.countryCode)}
            submitLabel="Crear sucursal"
            pendingLabel="Creando sucursal…"
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function NewBranchPage({ params }: NewBranchPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <NewBranchContent params={params} />
      </Suspense>
    </div>
  );
}
