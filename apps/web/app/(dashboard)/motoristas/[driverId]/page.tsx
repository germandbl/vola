import { canDriverServeMerchant, canManageAllDrivers } from "@vola/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DriverMerchantsForm } from "@/components/drivers/DriverMerchantsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { updateDriverMerchants } from "@/lib/driver-actions";
import { getDriver, getDriverMerchantOptions } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Motorista · Volá!" };

type DriverPageProps = PageProps<"/motoristas/[driverId]">;

async function DriverContent({ params }: Pick<DriverPageProps, "params">) {
  const driverId = readIdParam((await params).driverId);
  const [driver, merchants, currentUser] = await Promise.all([
    getDriver(driverId),
    getDriverMerchantOptions(),
    getCurrentUser(),
  ]);
  const servableMerchants = merchants.filter((merchant) =>
    canDriverServeMerchant(driver.owner, merchant),
  );

  return (
    <>
      <PageHeader
        title={driver.name}
        description={`${driver.owner.name} · ${driver.email} · ${driver.phoneNumber}`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Comercios que atiende</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverMerchantsForm
            save={updateDriverMerchants.bind(null, driverId)}
            merchants={servableMerchants}
            initialMerchantIds={driver.merchants.map((merchant) => merchant.id)}
            isMerchantSearchable={canManageAllDrivers(currentUser)}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function DriverPage({ params }: DriverPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <Link href="/motoristas">
          <ArrowLeft data-icon="inline-start" />
          Volver a los motoristas
        </Link>
      </Button>
      <Suspense fallback={<TableSkeleton />}>
        <DriverContent params={params} />
      </Suspense>
    </div>
  );
}
