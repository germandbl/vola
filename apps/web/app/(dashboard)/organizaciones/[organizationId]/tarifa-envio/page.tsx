import { OrganizationType } from "@vola/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DeliveryFeeRateForm } from "@/components/delivery-fees/DeliveryFeeRateForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDeliveryFeeRate, getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Tarifa por distancia · Volá!" };

type DeliveryFeeRatePageProps = PageProps<"/organizaciones/[organizationId]/tarifa-envio">;

async function DeliveryFeeRateContent({ params }: Pick<DeliveryFeeRatePageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const organization = await getOrganization(organizationId);
  if (organization.type !== OrganizationType.Merchant) notFound();
  const rate = await getDeliveryFeeRate(organizationId);

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/tarifas`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {organization.name}
        </Link>
      </Button>
      <PageHeader
        title="Tarifa por distancia"
        description={`Lo que ${organization.name} cobra por envío según la distancia del pedido.`}
      />
      <Card>
        <CardContent>
          <DeliveryFeeRateForm
            organizationId={organizationId}
            currency={organization.countryCurrency}
            initialRate={rate}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function DeliveryFeeRatePage({ params }: DeliveryFeeRatePageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <DeliveryFeeRateContent params={params} />
      </Suspense>
    </div>
  );
}
