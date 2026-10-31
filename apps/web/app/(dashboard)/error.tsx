"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

interface DashboardErrorProps {
  retry: () => void;
}

export default function DashboardError({ retry }: DashboardErrorProps) {
  return (
    <Empty role="alert" className="border border-solid bg-card">
      <EmptyHeader>
        <EmptyTitle className="text-lg font-semibold">No pudimos cargar tu panel</EmptyTitle>
        <EmptyDescription>
          Puede ser un problema de conexión. Probá de nuevo en un momento.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={retry}>
          <RotateCw data-icon="inline-start" />
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  );
}
