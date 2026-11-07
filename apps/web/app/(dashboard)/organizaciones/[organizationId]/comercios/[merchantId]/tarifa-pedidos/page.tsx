import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrderCountFeeRateForm } from "@/components/delivery-fees/OrderCountFeeRateForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderCountFeeRate, getOrganizationMerchant } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Tarifa por cantidad de pedidos · Volá!" };

type OrderCountFeeRatePageProps =
  PageProps<"/organizaciones/[organizationId]/comercios/[merchantId]/tarifa-pedidos">;

async function OrderCountFeeRateContent({ params }: Pick<OrderCountFeeRatePageProps, "params">) {
  const routeParams = await params;
  const organizationId = readIdParam(routeParams.organizationId);
  const merchantId = readIdParam(routeParams.merchantId);
  const [{ organization, merchant }, rate] = await Promise.all([
    getOrganizationMerchant(organizationId, merchantId),
    getOrderCountFeeRate(merchantId),
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
        title="Tarifa por cantidad de pedidos"
        description={`Lo que ${merchant.name} cobra por envío según cuántos pedidos lleva en el mes.`}
      />
      <Card>
        <CardContent>
          <OrderCountFeeRateForm
            merchantId={merchantId}
            currency={organization.countryCurrency}
            initialRate={rate}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function OrderCountFeeRatePage({ params }: OrderCountFeeRatePageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <OrderCountFeeRateContent params={params} />
      </Suspense>
    </div>
  );
}
