import type { DeliveryFeeRange, Organization } from "@vola/shared";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/labels";
import { getDeliveryFeeRate } from "@/lib/organizations-data";

function describeRangeDistance(ranges: DeliveryFeeRange[], index: number): string {
  const fromKm = index === 0 ? 0 : ranges[index - 1].upToKm;
  const { upToKm } = ranges[index];
  if (upToKm === null && fromKm === 0) return "Cualquier distancia";
  if (upToKm === null) return `Más de ${fromKm} km`;
  return `${fromKm} a ${upToKm} km`;
}

interface DeliveryFeeRateCardProps {
  organization: Organization;
}

export async function DeliveryFeeRateCard({ organization }: DeliveryFeeRateCardProps) {
  const rate = await getDeliveryFeeRate(organization.id);
  const isConfigured = rate.ranges.length > 0;
  const lastUpToKm = rate.ranges.at(-1)?.upToKm;
  const currency = organization.countryCurrency;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tarifa de envío</CardTitle>
        <CardAction>
          <Button asChild variant="outline">
            <Link href={`/organizaciones/${organization.id}/tarifa-envio`}>
              <Pencil data-icon="inline-start" />
              {isConfigured ? "Editar tarifa" : "Configurar tarifa"}
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!isConfigured && (
          <p className="text-sm text-muted-foreground">
            Este comercio todavía no tiene tarifa. Configurala para poder cobrar los envíos.
          </p>
        )}
        {isConfigured && (
          <dl className="flex flex-col divide-y">
            {rate.ranges.map((range, index) => (
              <div key={index} className="flex justify-between gap-4 py-2">
                <dt>{describeRangeDistance(rate.ranges, index)}</dt>
                <dd className="font-semibold">{formatMoney(range.fee, currency)}</dd>
              </div>
            ))}
            {rate.extraFeePerKm !== null && (
              <div className="flex justify-between gap-4 py-2">
                <dt>Cada km extra después de {lastUpToKm} km</dt>
                <dd className="font-semibold">+ {formatMoney(rate.extraFeePerKm, currency)}</dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
