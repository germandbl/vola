import type { SoftwareChargeDetail } from "@vola/shared";
import { formatMoney, formatMonthFraction, formatOrderCount } from "@/lib/labels";

// El desglose del cobro en la moneda del contrato, igual en el diálogo de facturar y en el detalle.
export function SoftwareChargeLines(props: SoftwareChargeDetail) {
  const { contractCurrency } = props;
  const extraOrdersAmount = props.extraOrderCount * props.extraOrderFee;
  const lines = [
    { label: "Meses que cubre el periodo", value: formatMonthFraction(props.monthFraction) },
    { label: "Órdenes entregadas", value: formatOrderCount(props.orderCount) },
    {
      label: `Costo del periodo (${formatMoney(props.monthlyFee, contractCurrency)} al mes)`,
      value: formatMoney(props.proratedMonthlyFee, contractCurrency),
    },
    {
      label: `Órdenes incluidas en el periodo (${formatOrderCount(props.includedOrders)} al mes)`,
      value: formatOrderCount(props.proratedIncludedOrders),
    },
    {
      label: `Excedente: ${formatOrderCount(props.extraOrderCount)} × ${formatMoney(props.extraOrderFee, contractCurrency)}`,
      value: formatMoney(extraOrdersAmount, contractCurrency),
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
        <dd className="shrink-0">{formatMoney(props.subtotal, contractCurrency)}</dd>
      </div>
    </dl>
  );
}
