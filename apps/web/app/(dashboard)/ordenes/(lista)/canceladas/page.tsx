import { OrderGroup } from "@vola/shared";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrdersGroupContent } from "@/components/orders/OrdersGroupContent";

export const metadata: Metadata = { title: "Órdenes canceladas · Volá!" };

export default function CancelledOrdersPage({ searchParams }: PageProps<"/ordenes/canceladas">) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrdersGroupContent group={OrderGroup.Cancelled} searchParams={searchParams} />
    </Suspense>
  );
}
