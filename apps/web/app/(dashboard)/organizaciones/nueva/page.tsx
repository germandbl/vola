import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrganizationForm } from "@/components/organizations/OrganizationForm";
import { Card, CardContent } from "@/components/ui/card";
import { createOrganization } from "@/lib/organization-actions";
import { getCountries } from "@/lib/organizations-data";

export const metadata: Metadata = { title: "Crear organización · Volá!" };

async function NewOrganizationForm() {
  const countries = await getCountries();
  return (
    <OrganizationForm
      action={createOrganization}
      countries={countries}
      submitLabel="Crear organización"
      pendingLabel="Creando…"
    />
  );
}

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title="Crear organización" />
      <Card>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <NewOrganizationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
