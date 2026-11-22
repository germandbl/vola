import { OrganizationType, canInvoiceMerchants } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { SoftwareContractForm } from "@/components/software-contracts/SoftwareContractForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getOrganization, getSoftwareContract } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Contrato · Volá!" };

type SoftwareContractPageProps = PageProps<"/organizaciones/[organizationId]/contrato">;

async function SoftwareContractContent({ params }: Pick<SoftwareContractPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const [organization, currentUser] = await Promise.all([getOrganization(organizationId), getCurrentUser()]);
  if (organization.type !== OrganizationType.Merchant) notFound();
  if (!canInvoiceMerchants(currentUser)) notFound();
  const { contract } = await getSoftwareContract(organizationId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Uso del software</CardTitle>
        <CardDescription>
          Lo que {organization.name} paga cada mes por usar Volá!, según las órdenes entregadas, con
          motoristas propios o de Volá!.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SoftwareContractForm organizationId={organizationId} contract={contract} />
      </CardContent>
    </Card>
  );
}

export default function SoftwareContractPage({ params }: SoftwareContractPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SoftwareContractContent params={params} />
    </Suspense>
  );
}
