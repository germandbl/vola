import { canViewAllOrders, canViewOrders, type OrderGroup } from "@vola/shared";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { readPageNumber } from "@/lib/route-params";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrdersTable } from "./OrdersTable";

interface OrdersGroupContentProps {
  group: OrderGroup;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Lo comparten las pestañas Activas, Completadas y Canceladas: solo cambia el grupo de órdenes.
export async function OrdersGroupContent({ group, searchParams }: OrdersGroupContentProps) {
  const page = readPageNumber((await searchParams).page);
  const currentUser = await getCurrentUser();
  if (!canViewOrders(currentUser)) notFound();

  return (
    <>
      <OrdersTable
        group={group}
        page={page}
        showOrganization={canViewAllOrders(currentUser)}
        currentUser={currentUser}
      />
      <OrderDetailSheet currentUser={currentUser} />
    </>
  );
}
