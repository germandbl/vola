import { DeliveryFeeBasis, calculateItemTotal, type OrderDetail } from "@vola/shared";
import type { ReactNode } from "react";
import { formatMoney } from "@/lib/labels";
import { OrderTimeline } from "./OrderTimeline";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function describeVolaFee(order: OrderDetail): string {
  const fee = formatMoney(order.volaDeliveryFee, order.currency);
  if (order.deliveryFeeBasis === DeliveryFeeBasis.Distance) return `${fee} · ${order.distanceKm} km`;
  return `${fee} · por cantidad de órdenes`;
}

interface OrderDetailBodyProps {
  order: OrderDetail;
}

export function OrderDetailBody({ order }: OrderDetailBodyProps) {
  const currency = order.currency;

  return (
    <div className="flex flex-col gap-6 px-5 py-4">
      <DetailSection title="Cliente">
        <p className="font-semibold">{order.customerName}</p>
        <p className="text-sm">{order.customerPhone}</p>
        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
      </DetailSection>

      <DetailSection title="Sucursal">
        <p className="font-semibold">
          {order.merchantName} · {order.branchName}
        </p>
        <p className="text-sm text-muted-foreground">{order.branchAddress}</p>
      </DetailSection>

      <DetailSection title="Productos">
        <ul className="flex flex-col gap-1">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4 text-sm">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatMoney(calculateItemTotal(item), currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1 border-t pt-2 text-sm">
          <div className="flex justify-between">
            <dt>Productos</dt>
            <dd>{formatMoney(order.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Envío al cliente</dt>
            <dd>{formatMoney(order.customerDeliveryFee, currency)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total del cliente</dt>
            <dd>{formatMoney(order.total, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Envío que cobra Volá!</dt>
            <dd>{describeVolaFee(order)}</dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="Motorista">
        <p>{order.driver?.name ?? "Sin asignar"}</p>
      </DetailSection>

      <DetailSection title="Historial">
        <OrderTimeline order={order} />
      </DetailSection>
    </div>
  );
}
