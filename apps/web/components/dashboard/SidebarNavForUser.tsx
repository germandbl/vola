import {
  canViewAllOrganizations,
  canViewOrganization,
  canViewOrders,
  type AuthUser,
} from "@vola/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarNav, type NavItem } from "./SidebarNav";

function getNavItems(user: AuthUser): NavItem[] {
  const items: NavItem[] = [{ href: "/", label: "Inicio", icon: "home" }];
  if (canViewOrders(user)) {
    items.push({ href: "/ordenes", label: "Órdenes", icon: "orders" });
  }
  if (canViewAllOrganizations(user)) {
    items.push({ href: "/organizaciones", label: "Organizaciones", icon: "organizations" });
    return items;
  }
  if (canViewOrganization(user, user.organizationId)) {
    items.push({
      href: `/organizaciones/${user.organizationId}`,
      label: "Mi organización",
      icon: "organizations",
    });
  }
  return items;
}

export async function SidebarNavForUser() {
  const user = await getCurrentUser();
  return <SidebarNav items={getNavItems(user)} />;
}

export function SidebarNavSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <Skeleton className="h-8 w-full bg-sidebar-border" />
      <Skeleton className="h-8 w-3/4 bg-sidebar-border" />
    </div>
  );
}
