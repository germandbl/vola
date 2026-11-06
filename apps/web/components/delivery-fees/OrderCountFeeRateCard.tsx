import type { OrderCountFeeRange, OrderCountFeeRate, Organization } from "@vola/shared";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/labels";

function describeOrderRange(ranges: OrderCountFeeRange[], index: number): string {
  const previousUpToOrderCount = index === 0 ? 0 : ranges[index - 1].upToOrderCount;
  const fromOrder = (previousUpToOrderCount ?? 0) + 1;
  const { upToOrderCount } = ranges[index];
  if (upToOrderCount === null && fromOrder === 1) return "Todos los pedidos del mes";
  if (upToOrderCount === null) return `Del pedido ${fromOrder} en adelante`;
  return `Pedidos ${fromOrder} a ${upToOrderCount} del mes`;
}

interface OrderCountFeeRateCardProps {
  organization: Organization;
  rate: OrderCountFeeRate;
  isActive: boolean;
}

export function OrderCountFeeRateCard({ organization, rate, isActive }: OrderCountFeeRateCardProps) {
  const isConfigured = rate.ranges.length > 0;
  const currency = organization.countryCurrency;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Tarifa por cantidad de pedidos
          {isActive && <Badge variant="secondary">Activa</Badge>}
        </CardTitle>
        <CardAction>
          <Button asChild variant="outline">
            <Link href={`/organizaciones/${organization.id}/tarifa-pedidos`}>
              <Pencil data-icon="inline-start" />
              {isConfigured ? "Editar tarifa" : "Configurar tarifa"}
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!isConfigured && (
          <p className="text-sm text-muted-foreground">
            Este comercio todavía no tiene tarifa por cantidad de pedidos.
          </p>
        )}
        {isConfigured && (
          <dl className="flex flex-col divide-y">
            {rate.ranges.map((range, index) => (
              <div key={index} className="flex justify-between gap-4 py-2">
                <dt>{describeOrderRange(rate.ranges, index)}</dt>
                <dd className="font-semibold">{formatMoney(range.fee, currency)} por pedido</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
