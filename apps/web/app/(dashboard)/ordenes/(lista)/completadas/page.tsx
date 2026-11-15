import { OrderGroup } from "@vola/shared";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrdersGroupContent } from "@/components/orders/OrdersGroupContent";

export const metadata: Metadata = { title: "Órdenes completadas · Volá!" };

export default function CompletedOrdersPage({ searchParams }: PageProps<"/ordenes/completadas">) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrdersGroupContent group={OrderGroup.Completed} searchParams={searchParams} />
    </Suspense>
  );
}
