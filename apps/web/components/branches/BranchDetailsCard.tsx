import type { Branch } from "@vola/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_OF_WEEK_LABEL } from "@/lib/labels";

function describeHours(opensAt: string | null, closesAt: string | null): string {
  if (opensAt === null || closesAt === null) return "Cerrada";
  return `${opensAt} a ${closesAt}`;
}

interface BranchDetailsCardProps {
  branch: Branch;
}

export function BranchDetailsCard({ branch }: BranchDetailsCardProps) {
  const mapUrl = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Datos de la sucursal</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <dl className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Dirección</dt>
          <dd>{branch.address}</dd>
          <dd className="text-sm">
            {branch.latitude}, {branch.longitude} ·{" "}
            <a href={mapUrl} target="_blank" rel="noreferrer" className="text-accion underline">
              Ver en Google Maps
            </a>
          </dd>
        </dl>
        <dl className="flex flex-col divide-y">
          {branch.openingHours.map((hours) => (
            <div key={hours.day} className="flex justify-between gap-4 py-2">
              <dt>{DAY_OF_WEEK_LABEL[hours.day]}</dt>
              <dd className="font-semibold">{describeHours(hours.opensAt, hours.closesAt)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
