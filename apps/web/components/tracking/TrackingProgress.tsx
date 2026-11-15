import { OrderStatus } from "@vola/shared";
import { cn } from "@/lib/utils";

// Las etapas que le importan a quien espera el pedido; los pasos internos del motorista caen en la primera.
const TRACKING_STAGES = ["Preparando", "En camino", "Entregado"] as const;

const STAGE_INDEX_BY_STATUS: Record<OrderStatus, number> = {
  [OrderStatus.New]: 0,
  [OrderStatus.Preparing]: 0,
  [OrderStatus.HeadingToBranch]: 0,
  [OrderStatus.AtBranch]: 0,
  [OrderStatus.OnTheWay]: 1,
  [OrderStatus.Delivered]: 2,
  [OrderStatus.Cancelled]: 0,
};

interface TrackingProgressProps {
  status: OrderStatus;
}

// Las barras son las líneas de velocidad de la marca: píldoras de 8 px que se llenan hasta la etapa actual.
export function TrackingProgress({ status }: TrackingProgressProps) {
  const currentStageIndex = STAGE_INDEX_BY_STATUS[status];

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Avance del pedido">
      {TRACKING_STAGES.map((stage, index) => {
        const isReached = index <= currentStageIndex;
        const isCurrent = index === currentStageIndex;
        return (
          <li key={stage} className="flex flex-col gap-1" aria-current={isCurrent ? "step" : undefined}>
            <span className={cn("h-2 rounded-full", isReached ? "bg-tinta" : "bg-linea")} />
            <span className={cn("text-xs", isCurrent ? "font-semibold text-tinta" : "text-tinta-suave")}>
              {stage}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
