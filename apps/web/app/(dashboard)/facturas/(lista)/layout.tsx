import { canAccessInvoices, canInvoiceMerchants } from "@vola/shared";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";

const INVOICE_TABS = [
  { href: "/facturas", label: "Facturas" },
  { href: "/facturas/por-facturar", label: "Por facturar" },
];

async function InvoicesHeader() {
  const currentUser = await getCurrentUser();
  if (!canAccessInvoices(currentUser)) notFound();

  if (!canInvoiceMerchants(currentUser)) {
    return (
      <PageHeader
        title="Facturas"
        description="Lo que Volá! te cobra por el envío de las órdenes que entregan sus motoristas y por el uso del software."
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Facturas"
        description="El envío de las órdenes de los motoristas de Volá! y el uso del software, facturados a cada comercio."
      />
      <SectionTabs label="Secciones de facturas" tabs={INVOICE_TABS} />
    </div>
  );
}

function InvoicesHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-8 w-80 max-w-full" />
    </div>
  );
}

export default function InvoicesLayout({ children }: LayoutProps<"/facturas">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<InvoicesHeaderSkeleton />}>
        <InvoicesHeader />
      </Suspense>
      {children}
    </div>
  );
}
