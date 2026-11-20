import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { PendingInvoicesTable } from "@/components/invoices/PendingInvoicesTable";

export const metadata: Metadata = { title: "Por facturar · Volá!" };

export default function PendingInvoicesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PendingInvoicesTable />
    </Suspense>
  );
}
