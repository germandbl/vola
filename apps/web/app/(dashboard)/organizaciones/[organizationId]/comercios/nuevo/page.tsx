import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { MerchantForm } from "@/components/merchants/MerchantForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMerchant } from "@/lib/merchant-actions";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Crear comercio · Volá!" };

type NewMerchantPageProps = PageProps<"/organizaciones/[organizationId]/comercios/nuevo">;

async function NewMerchantContent({ params }: Pick<NewMerchantPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const organization = await getOrganization(organizationId);

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/comercios`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {organization.name}
        </Link>
      </Button>
      <PageHeader title="Crear comercio" description={organization.name} />
      <Card>
        <CardContent>
          <MerchantForm
            action={createMerchant.bind(null, organizationId)}
            submitLabel="Crear comercio"
            pendingLabel="Creando comercio…"
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function NewMerchantPage({ params }: NewMerchantPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <NewMerchantContent params={params} />
      </Suspense>
    </div>
  );
}
