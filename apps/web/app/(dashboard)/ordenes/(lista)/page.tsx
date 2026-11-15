import { OrderGroup } from "@vola/shared";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrdersGroupContent } from "@/components/orders/OrdersGroupContent";

export const metadata: Metadata = { title: "Órdenes activas · Volá!" };

export default function ActiveOrdersPage({ searchParams }: PageProps<"/ordenes">) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrdersGroupContent group={OrderGroup.Active} searchParams={searchParams} />
    </Suspense>
  );
}
