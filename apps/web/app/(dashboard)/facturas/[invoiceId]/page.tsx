import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { InvoiceDetailContent } from "@/components/invoices/InvoiceDetailContent";
import { Button } from "@/components/ui/button";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Factura · Volá!" };

type InvoicePageProps = PageProps<"/facturas/[invoiceId]">;

async function InvoiceContent({ params }: Pick<InvoicePageProps, "params">) {
  const invoiceId = readIdParam((await params).invoiceId);
  return <InvoiceDetailContent invoiceId={invoiceId} />;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <Link href="/facturas">
          <ArrowLeft data-icon="inline-start" />
          Volver a facturas
        </Link>
      </Button>
      <Suspense fallback={<TableSkeleton />}>
        <InvoiceContent params={params} />
      </Suspense>
    </div>
  );
}
