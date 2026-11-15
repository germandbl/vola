"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useTransition, type ReactNode } from "react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

// Igual al intervalo con que la app de motoristas envía su ubicación y cambia estados.
export const LIVE_ORDERS_INTERVAL_MS = 10_000;

interface LiveOrdersContextValue {
  cycle: number;
  isRefreshing: boolean;
  refreshNow: () => void;
}

const LiveOrdersContext = createContext<LiveOrdersContextValue | null>(null);

// null fuera de la pestaña Activas: Completadas y Canceladas ya no cambian y no se actualizan solas.
export function useLiveOrders(): LiveOrdersContextValue | null {
  return use(LiveOrdersContext);
}

interface LiveOrdersProviderProps {
  children: ReactNode;
}

export function LiveOrdersProvider({ children }: LiveOrdersProviderProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  // router.refresh vuelve a pedir la tabla al servidor sin recargar la página ni perder el detalle abierto.
  const { cycle, refreshNow } = useAutoRefresh(LIVE_ORDERS_INTERVAL_MS, () =>
    startTransition(() => router.refresh()),
  );

  return (
    <LiveOrdersContext value={{ cycle, isRefreshing, refreshNow }}>{children}</LiveOrdersContext>
  );
}
