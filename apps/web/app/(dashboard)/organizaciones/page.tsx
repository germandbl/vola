import { RoleName } from "@vola/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { OrganizationsTable } from "@/components/organizations/OrganizationsTable";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { readPageNumber } from "@/lib/route-params";

export const metadata: Metadata = { title: "Organizaciones · Volá!" };

async function OrganizationsList({
  searchParams,
}: Pick<PageProps<"/organizaciones">, "searchParams">) {
  const { page } = await searchParams;
  return <OrganizationsTable page={readPageNumber(page)} />;
}

async function CreateOrganizationButton() {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== RoleName.Superadmin) return null;

  return (
    <Button asChild>
      <Link href="/organizaciones/nueva">
        <Plus data-icon="inline-start" />
        Crear organización
      </Link>
    </Button>
  );
}

export default function OrganizationsPage({ searchParams }: PageProps<"/organizaciones">) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Organizaciones"
        description="Clientes que usan Volá! y sus comercios."
        action={
          <Suspense fallback={null}>
            <CreateOrganizationButton />
          </Suspense>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <OrganizationsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
