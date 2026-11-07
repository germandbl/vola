"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SectionTab {
  href: string;
  label: string;
}

interface SectionTabsProps {
  label: string;
  tabs: SectionTab[];
}

// Radix enfoca la pestaña por código al hacer clic y el navegador lo toma como foco de teclado, así que mostraba
// el anillo azul. Cancelar el mousedown evita ese foco; el clic sigue navegando y el anillo queda para el teclado.
function preventFocusRingOnClick(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function SectionTabs({ label, tabs }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <Tabs value={pathname}>
      <nav aria-label={label} className="-mx-4 overflow-x-auto px-4">
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
