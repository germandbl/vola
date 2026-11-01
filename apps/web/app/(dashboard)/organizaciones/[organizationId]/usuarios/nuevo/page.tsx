import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TableSkeleton } from "@/components/TableSkeleton";
import { UserForm } from "@/components/organizations/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createUser } from "@/lib/organization-actions";
import { getOrganization } from "@/lib/organizations-data";
import { readIdParam } from "@/lib/route-params";

export const metadata: Metadata = { title: "Crear usuario · Volá!" };

type NewUserPageProps = PageProps<"/organizaciones/[organizationId]/usuarios/nuevo">;

async function NewUserContent({ params }: Pick<NewUserPageProps, "params">) {
  const organizationId = readIdParam((await params).organizationId);
  const organization = await getOrganization(organizationId);

  return (
    <>
      <Button asChild variant="ghost" className="self-start">
        <Link href={`/organizaciones/${organizationId}`}>
          <ArrowLeft data-icon="inline-start" />
          Volver a {organization.name}
        </Link>
      </Button>
      <PageHeader title="Crear usuario" description={organization.name} />
      <Card>
        <CardContent>
          <UserForm action={createUser.bind(null, organizationId)} />
        </CardContent>
      </Card>
    </>
  );
}

export default function NewUserPage({ params }: NewUserPageProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Suspense fallback={<TableSkeleton />}>
        <NewUserContent params={params} />
      </Suspense>
    </div>
  );
}
