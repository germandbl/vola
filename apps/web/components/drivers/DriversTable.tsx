import type { DriverSummary } from "@vola/shared";
import { Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewDetailButton } from "@/components/ViewDetailButton";
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
import { formatDate } from "@/lib/labels";
import { getDrivers } from "@/lib/organizations-data";

// Un motorista de la plataforma puede atender comercios de varios clientes, así que se agrupan por cliente.
function describeMerchants(driver: DriverSummary): string {
  if (driver.merchants.length === 0) return "Ninguno";
  if (!driver.owner.isPlatform) {
    return driver.merchants.map((merchant) => merchant.name).join(", ");
  }
  const merchantNamesByOrganization = new Map<string, string[]>();
  for (const merchant of driver.merchants) {
    const names = merchantNamesByOrganization.get(merchant.organizationName) ?? [];
    names.push(merchant.name);
    merchantNamesByOrganization.set(merchant.organizationName, names);
  }
  return [...merchantNamesByOrganization]
    .map(([organizationName, names]) => `${organizationName}: ${names.join(", ")}`)
    .join(" · ");
}

interface DriversTableProps {
  showOwner: boolean;
}

export async function DriversTable({ showOwner }: DriversTableProps) {
  const drivers = await getDrivers();

  if (drivers.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bike />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay motoristas</EmptyTitle>
          <EmptyDescription>Creá el primero para empezar a entregar.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            {showOwner && <TableHead>Pertenece a</TableHead>}
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Atiende</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-semibold">{driver.name}</TableCell>
              {showOwner && <TableCell>{driver.owner.name}</TableCell>}
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.phoneNumber}</TableCell>
              <TableCell className="whitespace-normal">{describeMerchants(driver)}</TableCell>
              <TableCell>
                <Badge variant={driver.isAvailable ? "secondary" : "outline"}>
                  {driver.isAvailable ? "Disponible" : "No disponible"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(driver.createdAt)}</TableCell>
              <TableCell className="text-right">
                <ViewDetailButton href={`/motoristas/${driver.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
