import { Building2 } from "lucide-react";
import { ListPagination } from "@/components/ListPagination";
import { ViewDetailButton } from "@/components/ViewDetailButton";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORGANIZATION_TYPE_LABEL, formatDate } from "@/lib/labels";
import { getOrganizationsPage } from "@/lib/organizations-data";

interface OrganizationsTableProps {
  page: number;
}

export async function OrganizationsTable({ page }: OrganizationsTableProps) {
  const organizationsPage = await getOrganizationsPage(page);

  if (organizationsPage.totalItems === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay organizaciones</EmptyTitle>
          <EmptyDescription>Creá la primera para darle acceso a un cliente.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizationsPage.items.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell className="font-semibold">{organization.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ORGANIZATION_TYPE_LABEL[organization.type]}</Badge>
                </TableCell>
                <TableCell>{organization.countryName ?? "Sin país"}</TableCell>
                <TableCell>{formatDate(organization.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <ViewDetailButton href={`/organizaciones/${organization.id}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        basePath="/organizaciones"
        page={organizationsPage.page}
        totalPages={organizationsPage.totalPages}
      />
    </div>
  );
}
