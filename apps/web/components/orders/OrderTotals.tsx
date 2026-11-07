import { formatMoney } from "@/lib/labels";

interface OrderTotalsProps {
  subtotal: number;
  customerDeliveryFee: number;
  total: number;
  currency: string | null;
}

export function OrderTotals({ subtotal, customerDeliveryFee, total, currency }: OrderTotalsProps) {
  return (
    <dl className="flex flex-col gap-2 rounded-lg bg-muted p-4">
      <div className="flex justify-between gap-4">
        <dt>Productos</dt>
        <dd>{formatMoney(subtotal, currency)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Envío al cliente</dt>
        <dd>{formatMoney(customerDeliveryFee, currency)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-borde pt-2 text-lg font-semibold">
        <dt>Total del cliente</dt>
        <dd>{formatMoney(total, currency)}</dd>
      </div>
      <p className="text-sm text-muted-foreground">
        El costo de envío que cobra Volá! se calcula al guardar, con la tarifa del comercio.
      </p>
    </dl>
  );
}
