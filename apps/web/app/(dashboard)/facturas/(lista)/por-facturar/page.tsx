import { canInvoiceMerchants } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { PendingInvoicesTable } from "@/components/invoices/PendingInvoicesTable";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Por facturar · Volá!" };

async function PendingInvoicesContent() {
  const currentUser = await getCurrentUser();
  if (!canInvoiceMerchants(currentUser)) notFound();
  return <PendingInvoicesTable />;
}

export default function PendingInvoicesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PendingInvoicesContent />
    </Suspense>
  );
}
