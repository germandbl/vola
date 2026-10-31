import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <div className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
