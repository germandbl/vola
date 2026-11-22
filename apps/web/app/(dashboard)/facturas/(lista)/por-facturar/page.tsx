import { canInvoiceMerchants } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { PendingInvoicesTable } from "@/components/invoices/PendingInvoicesTable";
import { PendingSoftwareInvoicesTable } from "@/components/invoices/PendingSoftwareInvoicesTable";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Por facturar · Volá!" };

async function PendingInvoicesContent() {
  const currentUser = await getCurrentUser();
  if (!canInvoiceMerchants(currentUser)) notFound();
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Envíos</h2>
          <p className="text-sm text-muted-foreground">Las órdenes que entregaron los motoristas de Volá!.</p>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <PendingInvoicesTable />
        </Suspense>
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Uso del software</h2>
          <p className="text-sm text-muted-foreground">
            Los meses cerrados de cada contrato, según las órdenes entregadas con cualquier motorista.
          </p>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <PendingSoftwareInvoicesTable />
        </Suspense>
      </section>
    </div>
  );
}

export default function PendingInvoicesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PendingInvoicesContent />
    </Suspense>
  );
}
