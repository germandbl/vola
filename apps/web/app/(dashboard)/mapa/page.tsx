import { canAccessDrivers, canManageAllDrivers, canViewAllOrders, canViewOrders } from "@vola/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LiveRefreshProvider } from "@/components/LiveRefreshProvider";
import { PageHeader } from "@/components/PageHeader";
import type { OperationLayer } from "@/components/operation-map/LayerToggles";
import { OperationMap } from "@/components/operation-map/OperationMap";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { getDefaultMapCenter } from "@/lib/map-defaults";
import { getOperationMap, getOrganization } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Mapa de la operación · Volá!" };

async function OperationMapContent() {
  const currentUser = await getCurrentUser();
  const canSeeOrders = canViewOrders(currentUser);
  const canSeeDrivers = canAccessDrivers(currentUser);
  if (!canSeeOrders && !canSeeDrivers) notFound();
  const [operation, organization] = await Promise.all([
    getOperationMap(),
    getOrganization(currentUser.organizationId),
  ]);
  // Cada capa aparece solo si el usuario puede ver ese dato.
  const layers: OperationLayer[] = [];
  if (canSeeDrivers) layers.push("drivers");
  if (canSeeOrders) layers.push("orders", "branches");

  return (
    <>
      <PageHeader
        title="Mapa de la operación"
        description={
          canViewAllOrders(currentUser)
            ? "Los motoristas trabajando, las órdenes activas y las sucursales de todos los comercios."
            : "Tus motoristas, tus órdenes activas y tus sucursales."
        }
      />
      <LiveRefreshProvider>
        <OperationMap
          operation={operation}
          layers={layers}
          defaultCenter={getDefaultMapCenter(organization.countryCode)}
          showDriverOwner={canManageAllDrivers(currentUser)}
        />
      </LiveRefreshProvider>
    </>
  );
}

export default function OperationMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Skeleton className="h-[calc(100dvh-12rem)] w-full" />}>
        <OperationMapContent />
      </Suspense>
    </div>
  );
}
