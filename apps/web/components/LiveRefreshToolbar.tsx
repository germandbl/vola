"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LIVE_ORDERS_INTERVAL_MS, useLiveOrders } from "./LiveOrdersProvider";

export function LiveOrdersToolbar() {
  const liveOrders = useLiveOrders();
  if (!liveOrders) return null;

  return (
    <div className="flex items-center justify-end gap-3">
      {/* key: cada ciclo monta una barra nueva, así la animación vuelve a empezar desde cero. */}
      <div
        aria-hidden="true"
        title="Se actualiza sola cada 10 segundos"
        className="h-1 w-24 overflow-hidden rounded-full bg-linea motion-reduce:hidden"
      >
        <div
          key={liveOrders.cycle}
          className="h-full origin-left animate-refresh-countdown rounded-full bg-cielo"
          style={{ animationDuration: `${LIVE_ORDERS_INTERVAL_MS}ms` }}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={liveOrders.refreshNow} disabled={liveOrders.isRefreshing}>
        <RefreshCw data-icon="inline-start" className={cn(liveOrders.isRefreshing && "animate-spin")} />
        Actualizar
        <span className="sr-only">. Las órdenes activas se actualizan solas cada 10 segundos.</span>
      </Button>
    </div>
  );
}
