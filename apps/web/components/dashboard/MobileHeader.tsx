import { Logo } from "@/components/Logo";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <header className="flex h-14 items-center gap-2 bg-sidebar px-4 text-sidebar-foreground md:hidden">
      <SidebarTrigger aria-label="Abrir menú" className="hover:bg-blanco/10 hover:text-blanco" />
      <Logo tone="blanco" size="medio" />
    </header>
  );
}
