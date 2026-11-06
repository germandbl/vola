import { canManageOrganization } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrganizationUsersTable } from "@/components/organizations/OrganizationUsersTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { readIdParam, readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Usuarios y permisos · Volá!" };

type OrganizationUsersPageProps = PageProps<"/organizaciones/[organizationId]/usuarios">;

async function OrganizationUsers({ params, searchParams }: OrganizationUsersPageProps) {
  const organizationId = readIdParam((await params).organizationId);
  const page = readPageNumber((await searchParams).page);
  const currentUser = await getCurrentUser();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        {canManageOrganization(currentUser, organizationId) && (
          <Button asChild>
            <Link href={`/organizaciones/${organizationId}/usuarios/nuevo`}>
              <Plus data-icon="inline-start" />
              Crear usuario
            </Link>
          </Button>
        )}
      </div>
      <OrganizationUsersTable organizationId={organizationId} page={page} />
    </section>
  );
}

export default function OrganizationUsersPage(props: OrganizationUsersPageProps) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrganizationUsers {...props} />
    </Suspense>
  );
}
