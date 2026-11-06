import type { Organization } from "@vola/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORGANIZATION_TYPE_LABEL, formatDate } from "@/lib/labels";

interface OrganizationInfoCardProps {
  organization: Organization;
}

export function OrganizationInfoCard({ organization }: OrganizationInfoCardProps) {
  const details = [
    { label: "Nombre", value: organization.name },
    { label: "Tipo", value: ORGANIZATION_TYPE_LABEL[organization.type] },
    { label: "País", value: organization.countryName ?? "Sin país" },
    { label: "Creada", value: formatDate(organization.createdAt) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Datos de la organización</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          {details.map((detail) => (
            <div key={detail.label} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="font-semibold">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
