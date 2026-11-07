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
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">{detail.label}</dt>
              <dd className="font-semibold break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
