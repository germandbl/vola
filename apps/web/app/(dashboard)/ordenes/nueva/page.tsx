import { ArrowLeft, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrderForm } from "@/components/orders/OrderForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { createOrder } from "@/lib/order-actions";
import { getOrderBranchOptions } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Crear orden · Volá!" };

async function NewOrderContent() {
  const branchOptions = await getOrderBranchOptions();

  if (branchOptions.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPin />
          </EmptyMedia>
          <EmptyTitle>No hay sucursales para crear órdenes</EmptyTitle>
          <EmptyDescription>
            Cada orden sale de una sucursal. Pedile a Volá! que registre al menos una, o revisá
            que tengás permiso para crear órdenes.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardContent>
        <OrderForm save={createOrder} branchOptions={branchOptions} />
      </CardContent>
    </Card>
  );
}

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <Link href="/ordenes">
          <ArrowLeft data-icon="inline-start" />
          Volver a las órdenes
        </Link>
      </Button>
      <PageHeader title="Crear orden" />
      <Suspense fallback={<TableSkeleton />}>
        <NewOrderContent />
      </Suspense>
    </div>
  );
}
