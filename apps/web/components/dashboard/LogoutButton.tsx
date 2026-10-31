"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton() {
  const { pending: isPending } = useFormStatus();

  return (
    <SidebarMenuButton type="submit" disabled={isPending}>
      {isPending ? <Spinner /> : <LogOut />}
      <span>{isPending ? "Cerrando sesión…" : "Cerrar sesión"}</span>
    </SidebarMenuButton>
  );
}
