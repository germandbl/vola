import type { CashAmount } from "@vola/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatOrderCount } from "@/lib/labels";
import { getCashWithPlatform } from "@/lib/organizations-data";

interface CashStepCardProps {
  title: string;
  description: string;
  cash: CashAmount;
  currency: string | null;
}

function CashStepCard({ title, description, cash, currency }: CashStepCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {/* mt-auto: los montos quedan alineados aunque las descripciones ocupen distintas líneas. */}
      <CardContent className="mt-auto flex flex-col gap-1">
        <p className="text-2xl font-bold">{formatMoney(cash.amount, currency)}</p>
        <p className="text-sm text-muted-foreground">{formatOrderCount(cash.orderCount)}</p>
      </CardContent>
    </Card>
  );
}

// Los tres pasos del efectivo que cobran motoristas de Volá! en tus órdenes, en el orden en que avanza.
export async function CashWithPlatformSummary() {
  const cash = await getCashWithPlatform();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <CashStepCard
        title="En manos del motorista"
        description="Lo cobraron motoristas de Volá! y todavía no lo entregan."
        cash={cash.withDrivers}
        currency={cash.currency}
      />
      <CashStepCard
        title="En Volá!, por liquidarte"
        description="Volá! ya lo recibió y te lo va a entregar."
        cash={cash.atPlatform}
        currency={cash.currency}
      />
      <CashStepCard
        title="Ya liquidado"
        description="Volá! ya te lo entregó."
        cash={cash.settled}
        currency={cash.currency}
      />
    </div>
  );
}
