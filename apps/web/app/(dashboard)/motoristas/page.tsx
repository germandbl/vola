import { canAccessDrivers, canManageAllDrivers } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { DriversTable } from "@/components/drivers/DriversTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Motoristas · Volá!" };

async function DriversContent() {
  const currentUser = await getCurrentUser();
  if (!canAccessDrivers(currentUser)) notFound();
  const isPlatformUser = canManageAllDrivers(currentUser);

  return (
    <>
      <PageHeader
        title="Motoristas"
        description={
          isPlatformUser
            ? "Motoristas de la plataforma y de cada cliente."
            : "Tu propio equipo de entrega. Solo tu organización los ve."
        }
        action={
          <Button asChild>
            <Link href="/motoristas/nuevo">
              <Plus data-icon="inline-start" />
              Crear motorista
            </Link>
          </Button>
        }
      />
      <DriversTable showOwner={isPlatformUser} />
    </>
  );
}

export default function DriversPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <DriversContent />
      </Suspense>
    </div>
  );
}
