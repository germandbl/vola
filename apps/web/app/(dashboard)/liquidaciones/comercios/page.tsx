import { canSettlePlatformCash } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { PendingMerchantsTable } from "@/components/settlements/PendingMerchantsTable";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Liquidar a comercios · Volá!" };

async function PendingMerchantsContent() {
  const currentUser = await getCurrentUser();
  if (!canSettlePlatformCash(currentUser)) notFound();
  return <PendingMerchantsTable />;
}

export default function PendingMerchantsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PendingMerchantsContent />
    </Suspense>
  );
}
