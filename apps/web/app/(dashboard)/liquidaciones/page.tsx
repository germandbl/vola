import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { PendingDriversTable } from "@/components/settlements/PendingDriversTable";

export const metadata: Metadata = { title: "Liquidaciones · Volá!" };

export default function PendingDriversPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PendingDriversTable />
    </Suspense>
  );
}
