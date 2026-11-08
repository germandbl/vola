import { canManageAllDrivers } from "@vola/shared";
import { ArrowLeft, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DriverForm } from "@/components/drivers/DriverForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/current-user";
import { createDriver } from "@/lib/driver-actions";
import { getDriverMerchantOptions, getDriverOwnerOptions } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Crear motorista · Volá!" };

async function NewDriverContent() {
  const [owners, merchants, currentUser] = await Promise.all([
    getDriverOwnerOptions(),
    getDriverMerchantOptions(),
    getCurrentUser(),
  ]);

  if (merchants.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay comercios</EmptyTitle>
          <EmptyDescription>
            Cada motorista atiende uno o más comercios. Creá un comercio primero.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardContent>
        <DriverForm
          save={createDriver}
          owners={owners}
          merchants={merchants}
          isMerchantSearchable={canManageAllDrivers(currentUser)}
        />
      </CardContent>
    </Card>
  );
}

export default function NewDriverPage() {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <Link href="/motoristas">
          <ArrowLeft data-icon="inline-start" />
          Volver a los motoristas
        </Link>
      </Button>
      <PageHeader
        title="Crear motorista"
        description="Con este email y contraseña entra a la app de motoristas."
      />
      <Suspense fallback={<TableSkeleton />}>
        <NewDriverContent />
      </Suspense>
    </div>
  );
}
