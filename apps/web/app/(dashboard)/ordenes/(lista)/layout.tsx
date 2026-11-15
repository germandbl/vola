import {
  OrderGroup,
  canCreateOrders,
  canCreateOrdersForAnyOrganization,
  canViewOrders,
  type AuthUser,
} from "@vola/shared";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs, type SectionTab } from "@/components/SectionTabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { ORDER_GROUP_LABEL, ORDER_GROUP_PATH } from "@/lib/order-groups";

const ORDER_GROUP_TABS: SectionTab[] = [OrderGroup.Active, OrderGroup.Completed, OrderGroup.Cancelled].map(
  (group) => ({ href: ORDER_GROUP_PATH[group], label: ORDER_GROUP_LABEL[group] }),
);

function canCreateAnyOrder(user: AuthUser): boolean {
  if (canCreateOrdersForAnyOrganization(user)) return true;
  return canCreateOrders(user, user.organizationId);
}

async function OrdersHeader() {
  const currentUser = await getCurrentUser();
  if (!canViewOrders(currentUser)) notFound();

  return (
    <div className="flex flex-col gap-4">
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
      <SectionTabs label="Órdenes por estado" tabs={ORDER_GROUP_TABS} />
    </div>
  );
}

function OrdersHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-8 w-80 max-w-full" />
    </div>
  );
}

export default function OrdersLayout({ children }: LayoutProps<"/ordenes">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<OrdersHeaderSkeleton />}>
        <OrdersHeader />
      </Suspense>
      {children}
    </div>
  );
}
