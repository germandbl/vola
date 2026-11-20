import type { Metadata } from "next";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Facturas · Volá!" };

type InvoicesPageProps = PageProps<"/facturas">;

async function InvoicesContent({ searchParams }: Pick<InvoicesPageProps, "searchParams">) {
  const page = readPageNumber((await searchParams).page);
  return <InvoicesTable page={page} />;
}

export default function InvoicesPage({ searchParams }: InvoicesPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <InvoicesContent searchParams={searchParams} />
    </Suspense>
  );
}
