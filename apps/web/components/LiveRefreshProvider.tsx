"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useTransition, type ReactNode } from "react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

// Igual al intervalo con que la app de motoristas envía su ubicación y cambia estados.
export const LIVE_REFRESH_INTERVAL_MS = 10_000;

interface LiveRefreshContextValue {
  cycle: number;
  isRefreshing: boolean;
  refreshNow: () => void;
}

const LiveRefreshContext = createContext<LiveRefreshContextValue | null>(null);

// null fuera de una vista en vivo, por ejemplo en las órdenes completadas y canceladas, que ya no cambian.
export function useLiveRefresh(): LiveRefreshContextValue | null {
  return use(LiveRefreshContext);
}

interface LiveRefreshProviderProps {
  children: ReactNode;
}

export function LiveRefreshProvider({ children }: LiveRefreshProviderProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  // router.refresh vuelve a pedir los datos al servidor sin recargar la página ni perder lo que está abierto.
  const { cycle, refreshNow } = useAutoRefresh(LIVE_REFRESH_INTERVAL_MS, () =>
    startTransition(() => router.refresh()),
  );

  return (
    <LiveRefreshContext value={{ cycle, isRefreshing, refreshNow }}>{children}</LiveRefreshContext>
  );
}
