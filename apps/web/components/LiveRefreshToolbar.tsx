"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LIVE_REFRESH_INTERVAL_MS, useLiveRefresh } from "./LiveRefreshProvider";

interface LiveRefreshToolbarProps {
  // Qué se actualiza solo, para lectores de pantalla y el texto al pasar el mouse.
  description: string;
}

export function LiveRefreshToolbar({ description }: LiveRefreshToolbarProps) {
  const liveRefresh = useLiveRefresh();
  if (!liveRefresh) return null;

  return (
    <div className="flex items-center justify-end gap-3">
      {/* key: cada ciclo monta una barra nueva, así la animación vuelve a empezar desde cero. */}
      <div
        aria-hidden="true"
        title={description}
        className="h-1 w-24 overflow-hidden rounded-full bg-linea motion-reduce:hidden"
      >
        <div
          key={liveRefresh.cycle}
          className="h-full origin-left animate-refresh-countdown rounded-full bg-cielo"
          style={{ animationDuration: `${LIVE_REFRESH_INTERVAL_MS}ms` }}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={liveRefresh.refreshNow} disabled={liveRefresh.isRefreshing}>
        <RefreshCw data-icon="inline-start" className={cn(liveRefresh.isRefreshing && "animate-spin")} />
        Actualizar
        <span className="sr-only">. {description}</span>
      </Button>
    </div>
  );
}
