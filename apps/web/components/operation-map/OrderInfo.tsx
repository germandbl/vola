import { ORDER_STATUS_LABEL, type OperationMapOrder } from "@vola/shared";
import Link from "next/link";
import { ORDER_DETAIL_PARAM } from "@/lib/order-detail-param";

interface OrderInfoProps {
  order: OperationMapOrder;
}

export function OrderInfo({ order }: OrderInfoProps) {
  return (
    <div className="flex min-w-48 flex-col gap-1 text-sm text-tinta">
      <p className="font-semibold">{ORDER_STATUS_LABEL[order.status]}</p>
      <p>Para {order.customerName}</p>
      <p className="text-muted-foreground">
        {order.merchantName} · {order.branchName}
      </p>
      <p>{order.driverName ? `Motorista: ${order.driverName}` : "Sin motorista asignado"}</p>
      <Link href={`/ordenes?${ORDER_DETAIL_PARAM}=${order.id}`} className="text-accion underline-offset-4 hover:underline">
        Ver orden
      </Link>
    </div>
  );
}
