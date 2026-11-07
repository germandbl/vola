import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DeliveryFeeRateForm } from "@/components/delivery-fees/DeliveryFeeRateForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDeliveryFeeRate, getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Tarifa por distancia · Volá!" };

type DeliveryFeeRatePageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/tarifa-envio">;

async function DeliveryFeeRateContent({ params }: Pick<DeliveryFeeRatePageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const [{ organization, merchant }, rate] = await Promise.all([
    getOrganizationMerchant(organizationId, merchantId),
    getDeliveryFeeRate(merchantId),
  ]);

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}/comercios/${merchantId}/tarifas`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {merchant.name}
        </Link>
      </Button>
      <PageHeader
        title="Tarifa por distancia"
        description={`Lo que ${merchant.name} cobra por envío según la distancia del pedido.`}
      />
      <Card>
        <CardContent>
          <DeliveryFeeRateForm
            merchantId={merchantId}
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
