import { canAccessDrivers, canManageAllDrivers } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LiveRefreshProvider } from "@/components/LiveRefreshProvider";
import { LiveRefreshToolbar } from "@/components/LiveRefreshToolbar";
import { PageHeader } from "@/components/PageHeader";
import { DriversMap } from "@/components/drivers-map/DriversMap";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getDefaultMapCenter } from "@/lib/map-defaults";
import { getDriverLocations, getOrganization } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Mapa de motoristas · Volá!" };

async function DriversMapContent() {
  const currentUser = await getCurrentUser();
  if (!canAccessDrivers(currentUser)) notFound();
  const [drivers, organization] = await Promise.all([
    getDriverLocations(),
    getOrganization(currentUser.organizationId),
  ]);
  const isPlatformUser = canManageAllDrivers(currentUser);

  return (
    <>
      <PageHeader
        title="Mapa de motoristas"
        description={
          isPlatformUser
            ? "Dónde están los motoristas que están trabajando, de Volá! y de cada cliente."
            : "Dónde están tus motoristas y los de Volá! que llevan tus órdenes."
        }
      />
      <LiveRefreshProvider>
        <div className="flex flex-col gap-3">
          <LiveRefreshToolbar description="El mapa se actualiza solo cada 10 segundos." />
          <DriversMap
            drivers={drivers}
            defaultCenter={getDefaultMapCenter(organization.countryCode)}
            showOwner={isPlatformUser}
          />
        </div>
      </LiveRefreshProvider>
    </>
  );
}

export default function DriversMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Skeleton className="h-[calc(100dvh-12rem)] w-full" />}>
        <DriversMapContent />
      </Suspense>
    </div>
  );
}
