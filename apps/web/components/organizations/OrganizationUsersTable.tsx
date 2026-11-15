import {
  RoleName,
  findAssignablePermissions,
  type OrganizationType,
  type UserSummary,
} from "@vola/shared";
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
import { AgentPermissionsDialog } from "./AgentPermissionsDialog";

// Un administrator o un driver hace lo que su rol permite; solo un agent tiene permisos sueltos.
// Aquí va solo la cantidad: el detalle de cada permiso está en el diálogo para editarlos.
function describePermissions(user: UserSummary): string {
  if (user.role !== RoleName.Agent) return "Fijos por su rol";
  if (user.permissions.length === 0) return "Sin permisos";
  if (user.permissions.length === 1) return "1 permiso";
  return `${user.permissions.length} permisos`;
}

interface OrganizationUsersTableProps {
  organizationId: number;
  organizationType: OrganizationType;
  canEditPermissions: boolean;
  page: number;
}

export async function OrganizationUsersTable({
  organizationId,
  organizationType,
  canEditPermissions,
  page,
}: OrganizationUsersTableProps) {
  const usersPage = await getOrganizationUsersPage(organizationId, page);
  const assignablePermissions = findAssignablePermissions(organizationType);

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
              <TableHead>Permisos</TableHead>
              <TableHead>Creado</TableHead>
              {canEditPermissions && (
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersPage.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {describePermissions(user)}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                {canEditPermissions && (
                  <TableCell className="text-right">
                    {user.role === RoleName.Agent && (
                      <AgentPermissionsDialog
                        organizationId={organizationId}
                        userId={user.id}
                        userName={user.name}
                        currentPermissions={user.permissions}
                        assignablePermissions={assignablePermissions}
                      />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        basePath={`/organizaciones/${organizationId}/usuarios`}
        page={usersPage.page}
        totalPages={usersPage.totalPages}
      />
    </div>
  );
}
