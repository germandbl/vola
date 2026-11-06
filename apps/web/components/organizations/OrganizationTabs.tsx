"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface OrganizationTab {
  href: string;
  label: string;
}

interface OrganizationTabsProps {
  tabs: OrganizationTab[];
}

// Radix enfoca la pestaña por código al hacer clic y el navegador lo toma como foco de teclado, así que mostraba
// el anillo azul. Cancelar el mousedown evita ese foco; el clic sigue navegando y el anillo queda para el teclado.
function preventFocusRingOnClick(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function OrganizationTabs({ tabs }: OrganizationTabsProps) {
  const pathname = usePathname();

  return (
    <Tabs value={pathname}>
      <nav aria-label="Secciones de la organización" className="-mx-4 overflow-x-auto px-4">
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.href}
              value={tab.href}
              asChild
              onMouseDown={preventFocusRingOnClick}
            >
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </nav>
    </Tabs>
  );
}
