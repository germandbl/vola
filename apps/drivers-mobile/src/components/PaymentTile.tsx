import { PaymentMethod } from "@vola/shared";
import { formatMoney } from "@/lib/format";
import { StatTile } from "./StatTile";

interface PaymentTileProps {
  paymentMethod: PaymentMethod;
  total: number;
  currency: string | null;
}

// Con tarjeta el motorista no cobra nada; en efectivo necesita ver el monto exacto antes de llegar.
export function PaymentTile({ paymentMethod, total, currency }: PaymentTileProps) {
  if (paymentMethod === PaymentMethod.Card) {
    return (
      <StatTile icon="credit-card" label="Pagado con tarjeta" tone="bruma">
        No cobrés nada
      </StatTile>
    );
  }
  return (
    <StatTile icon="dollar-sign" label="Cobrá en efectivo" tone="bruma">
      {formatMoney(total, currency)}
    </StatTile>
  );
}
