import { canAccessSettlements, canSettlePlatformCash, type AuthUser } from "@vola/shared";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs, type SectionTab } from "@/components/SectionTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";

// Volá! recibe de sus motoristas y le liquida a los comercios; un comercio recibe de su flota y ve lo que Volá! le debe.
function getTabs(user: AuthUser): SectionTab[] {
  if (canSettlePlatformCash(user)) {
    return [
      { href: "/liquidaciones", label: "Motoristas" },
      { href: "/liquidaciones/comercios", label: "Comercios" },
      { href: "/liquidaciones/historial", label: "Historial" },
    ];
  }
  return [
    { href: "/liquidaciones", label: "Mis motoristas" },
    { href: "/liquidaciones/efectivo-con-vola", label: "Efectivo con Volá!" },
    { href: "/liquidaciones/historial", label: "Historial" },
  ];
}

async function SettlementsHeader() {
  const currentUser = await getCurrentUser();
  if (!canAccessSettlements(currentUser)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Liquidaciones"
        description="El efectivo que cobran los motoristas, hasta que llega a cada comercio."
      />
      <SectionTabs label="Secciones de liquidaciones" tabs={getTabs(currentUser)} />
    </div>
  );
}

function SettlementsHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-8 w-80 max-w-full" />
    </div>
  );
}

export default function SettlementsLayout({ children }: LayoutProps<"/liquidaciones">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<SettlementsHeaderSkeleton />}>
        <SettlementsHeader />
      </Suspense>
      {children}
    </div>
  );
}
