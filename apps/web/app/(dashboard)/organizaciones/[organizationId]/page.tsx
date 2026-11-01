import { RoleName } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EditOrganizationCard } from "@/components/organizations/EditOrganizationCard";
import { OrganizationUsersTable } from "@/components/organizations/OrganizationUsersTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";
import { ORGANIZATION_TYPE_LABEL } from "@/lib/labels";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam, readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Organización · Volá!" };

type OrganizationPageProps = PageProps<"/organizaciones/[organizationId]">;

async function OrganizationDetail({ params, searchParams }: OrganizationPageProps) {
  const organizationId = readIdParam((await params).organizationId);
  const page = readPageNumber((await searchParams).page);
  const [organization, currentUser] = await Promise.all([
    getOrganization(organizationId),
    getCurrentUser(),
  ]);
  const countryLabel = organization.countryName ?? "Sin país";

  return (
    <>
      <PageHeader
        title={organization.name}
        description={`${ORGANIZATION_TYPE_LABEL[organization.type]} · ${countryLabel}`}
      />
      {currentUser.role === RoleName.Superadmin && (
        <EditOrganizationCard organization={organization} />
      )}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Usuarios</h2>
          <Button asChild>
            <Link href={`/organizaciones/${organizationId}/usuarios/nuevo`}>
              <Plus data-icon="inline-start" />
              Crear usuario
            </Link>
          </Button>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <OrganizationUsersTable organizationId={organizationId} page={page} />
        </Suspense>
      </section>
    </>
  );
}

function OrganizationDetailSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-40" />
      </div>
      <TableSkeleton />
    </>
  );
}

export default function OrganizationPage(props: OrganizationPageProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Suspense fallback={<OrganizationDetailSkeleton />}>
        <OrganizationDetail {...props} />
      </Suspense>
    </div>
  );
}
