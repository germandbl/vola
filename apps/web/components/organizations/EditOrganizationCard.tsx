import type { Organization } from "@vola/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganization } from "@/lib/organization-actions";
import { getCountries } from "@/lib/organizations-data";
import { OrganizationForm } from "./OrganizationForm";

interface EditOrganizationCardProps {
  organization: Organization;
}

export async function EditOrganizationCard({ organization }: EditOrganizationCardProps) {
  const countries = await getCountries();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Datos de la organización</CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationForm
          action={updateOrganization.bind(null, organization.id)}
          countries={countries}
          organization={organization}
          submitLabel="Guardar cambios"
          pendingLabel="Guardando…"
        />
      </CardContent>
    </Card>
  );
}
