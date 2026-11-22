import type { SoftwareInvoiceBreakdown } from "@vola/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/labels";
import { SoftwareChargeLines } from "./SoftwareChargeLines";

interface SoftwareInvoiceBreakdownCardProps {
  breakdown: SoftwareInvoiceBreakdown;
  amount: number;
  currency: string | null;
}

export function SoftwareInvoiceBreakdownCard({ breakdown, amount, currency }: SoftwareInvoiceBreakdownCardProps) {
  const isConverted = breakdown.contractCurrency !== currency;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cobro según el contrato</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SoftwareChargeLines {...breakdown} />
        {isConverted && (
          <p className="text-sm text-muted-foreground">
            Tasa de cambio: 1 {breakdown.contractCurrency} = {breakdown.exchangeRate} {currency}
          </p>
        )}
        <div className="flex justify-between px-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(amount, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
