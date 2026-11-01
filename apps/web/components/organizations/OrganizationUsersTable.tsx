import { Users } from "lucide-react";
import { ListPagination } from "@/components/ListPagination";
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
import { ROLE_LABEL, formatDate } from "@/lib/labels";
import { getOrganizationUsersPage } from "@/lib/organizations-data";

interface OrganizationUsersTableProps {
  organizationId: number;
  page: number;
}

export async function OrganizationUsersTable({
  organizationId,
  page,
}: OrganizationUsersTableProps) {
  const usersPage = await getOrganizationUsersPage(organizationId, page);

  if (usersPage.totalItems === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Esta organización no tiene usuarios</EmptyTitle>
          <EmptyDescription>Creá el primero para que pueda entrar al panel.</EmptyDescription>
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
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersPage.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        basePath={`/organizaciones/${organizationId}`}
        page={usersPage.page}
        totalPages={usersPage.totalPages}
      />
    </div>
  );
}
