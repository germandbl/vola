import { ORDER_STATUS_LABEL, type OrderDetail } from "@vola/shared";
import { formatDateTime } from "@/lib/labels";

interface TimelineEntry {
  label: string;
  detail: string | null;
  at: string;
}

// La creación y la asignación no son cambios de estado, pero son parte de la historia de la orden.
function buildTimeline(order: OrderDetail): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { label: "Creada", detail: `por ${order.createdByName}`, at: order.createdAt },
  ];
  if (order.assignedAt && order.driver) {
    entries.push({ label: `Asignada a ${order.driver.name}`, detail: null, at: order.assignedAt });
  }
  for (const change of order.statusHistory) {
    const reason = change.cancellationReason ? ` · Motivo: ${change.cancellationReason}` : "";
    entries.push({
      label: ORDER_STATUS_LABEL[change.status],
      detail: `por ${change.changedByName}${reason}`,
      at: change.changedAt,
    });
  }
  return entries.sort((first, second) => first.at.localeCompare(second.at));
}

interface OrderTimelineProps {
  order: OrderDetail;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  return (
    <ol className="flex flex-col gap-4 border-l border-linea pl-4">
      {buildTimeline(order).map((entry, index) => (
        <li key={index} className="relative flex flex-col">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-tinta"
          />
          <span className="font-semibold">{entry.label}</span>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(entry.at)}
            {entry.detail && ` · ${entry.detail}`}
          </span>
        </li>
      ))}
    </ol>
  );
}
