import { formatMoney, formatOrderCount } from "@/lib/labels";

interface SoftwareChargeLinesProps {
  contractCurrency: string;
  monthlyFee: number;
  includedOrders: number;
  extraOrderFee: number;
  orderCount: number;
  extraOrderCount: number;
  subtotal: number;
}

// El desglose del cobro en la moneda del contrato, igual en el diálogo de facturar y en el detalle.
export function SoftwareChargeLines(props: SoftwareChargeLinesProps) {
  const extraOrdersAmount = props.extraOrderCount * props.extraOrderFee;
  const lines = [
    { label: "Órdenes entregadas en el mes", value: formatOrderCount(props.orderCount) },
    {
      label: `Costo mensual (incluye ${formatOrderCount(props.includedOrders)})`,
      value: formatMoney(props.monthlyFee, props.contractCurrency),
    },
    {
      label: `Excedente: ${formatOrderCount(props.extraOrderCount)} × ${formatMoney(props.extraOrderFee, props.contractCurrency)}`,
      value: formatMoney(extraOrdersAmount, props.contractCurrency),
    },
  ];

  return (
    <dl className="flex flex-col divide-y rounded-lg border text-sm">
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-4 px-3 py-2">
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd className="shrink-0">{line.value}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 px-3 py-2 font-semibold">
        <dt>Subtotal</dt>
        <dd className="shrink-0">{formatMoney(props.subtotal, props.contractCurrency)}</dd>
      </div>
    </dl>
  );
}
