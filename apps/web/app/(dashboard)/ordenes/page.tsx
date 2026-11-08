import {
  canCreateOrders,
  canCreateOrdersForAnyOrganization,
  canViewAllOrders,
  canViewOrders,
  type AuthUser,
} from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrderDetailSheet } from "@/components/orders/OrderDetailSheet";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Órdenes · Volá!" };

function canCreateAnyOrder(user: AuthUser): boolean {
  if (canCreateOrdersForAnyOrganization(user)) return true;
  return canCreateOrders(user, user.organizationId);
}

async function OrdersContent({ searchParams }: Pick<PageProps<"/ordenes">, "searchParams">) {
  const page = readPageNumber((await searchParams).page);
  const currentUser = await getCurrentUser();
  if (!canViewOrders(currentUser)) notFound();

  return (
    <>
      <PageHeader
        title="Órdenes"
        description="Las órdenes que se mandan a entregar."
        action={
          canCreateAnyOrder(currentUser) && (
            <Button asChild>
              <Link href="/ordenes/nueva">
                <Plus data-icon="inline-start" />
                Crear orden
              </Link>
            </Button>
          )
        }
      />
      <OrdersTable
        page={page}
        showOrganization={canViewAllOrders(currentUser)}
        currentUser={currentUser}
      />
    </>
  );
}

export default function OrdersPage({ searchParams }: PageProps<"/ordenes">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <OrderDetailSheet />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
