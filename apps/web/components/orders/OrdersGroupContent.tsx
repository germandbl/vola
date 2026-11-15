import { OrderGroup, canViewAllOrders, canViewOrders } from "@vola/shared";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { readPageNumber } from "@/lib/route-params";
import { LiveRefreshProvider } from "@/components/LiveRefreshProvider";
import { LiveRefreshToolbar } from "@/components/LiveRefreshToolbar";
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

  const content = (
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
  // Solo las activas se actualizan solas: son las que todavía cambian de estado, preparación o motorista.
  if (group !== OrderGroup.Active) return content;
  return (
    <LiveRefreshProvider>
      <div className="flex flex-col gap-3">
        <LiveRefreshToolbar description="Las órdenes activas se actualizan solas cada 10 segundos." />
        {content}
      </div>
    </LiveRefreshProvider>
  );
}
