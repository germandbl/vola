import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth-actions";
import { LogoutButton } from "./LogoutButton";
import { SidebarNavForUser, SidebarNavSkeleton } from "./SidebarNavForUser";
import { UserSummary, UserSummarySkeleton } from "./UserSummary";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Logo tone="blanco" size="medio" />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={<SidebarNavSkeleton />}>
          <SidebarNavForUser />
        </Suspense>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="gap-4 pb-4">
        <Suspense fallback={<UserSummarySkeleton />}>
          <UserSummary />
        </Suspense>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <LogoutButton />
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
