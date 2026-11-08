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
import { createDriver } from "@/lib/driver-actions";
import { getDriverMerchantOptions } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Crear motorista · Volá!" };

async function NewDriverContent() {
  const merchants = await getDriverMerchantOptions();

  if (merchants.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>Todavía no tenés comercios</EmptyTitle>
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
        <DriverForm save={createDriver} merchants={merchants} />
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
