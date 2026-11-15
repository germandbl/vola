import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { SettlementHistoryTable } from "@/components/settlements/SettlementHistoryTable";
import { readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Historial de liquidaciones · Volá!" };

type SettlementHistoryPageProps = PageProps<"/liquidaciones/historial">;

async function SettlementHistoryContent({ searchParams }: Pick<SettlementHistoryPageProps, "searchParams">) {
  const page = readPageNumber((await searchParams).page);
  return <SettlementHistoryTable page={page} />;
}

export default function SettlementHistoryPage({ searchParams }: SettlementHistoryPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SettlementHistoryContent searchParams={searchParams} />
    </Suspense>
  );
}
