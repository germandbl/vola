import { ORDER_STATUS_LABEL, OrderStatus } from "@vola/shared";
import { Bike, ChefHat, CircleCheck, CircleDot, CircleX, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ORDER_STATUS_ICON: Record<OrderStatus, LucideIcon> = {
  [OrderStatus.New]: CircleDot,
  [OrderStatus.Preparing]: ChefHat,
  [OrderStatus.OnTheWay]: Bike,
  [OrderStatus.Delivered]: CircleCheck,
  [OrderStatus.Cancelled]: CircleX,
};

interface OrderStatusChipProps {
  status: OrderStatus;
}

export function OrderStatusChip({ status }: OrderStatusChipProps) {
  const Icon = ORDER_STATUS_ICON[status];
  return (
    <Badge className="rounded-full bg-nube px-2 py-1 text-xs font-semibold text-tinta">
      <Icon data-icon="inline-start" />
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
