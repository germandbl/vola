import { canSettleOwnCash } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CashWithPlatformSummary } from "@/components/settlements/CashWithPlatformSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Efectivo con Volá! · Volá!" };

async function CashWithPlatformContent() {
  const currentUser = await getCurrentUser();
  if (!canSettleOwnCash(currentUser)) notFound();
  return <CashWithPlatformSummary />;
}

export default function CashWithPlatformPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <CashWithPlatformContent />
    </Suspense>
  );
}
