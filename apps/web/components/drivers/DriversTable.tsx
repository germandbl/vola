import type { DriverSummary } from "@vola/shared";
import { Bike } from "lucide-react";
import Link from "next/link";
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
import { getOwnDrivers } from "@/lib/organizations-data";

function describeMerchants(driver: DriverSummary): string {
  if (driver.merchants.length === 0) return "Ninguno";
  return driver.merchants.map((merchant) => merchant.name).join(", ");
}

export async function DriversTable() {
  const drivers = await getOwnDrivers();

  if (drivers.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bike />
          </EmptyMedia>
          <EmptyTitle>Todavía no tenés motoristas</EmptyTitle>
          <EmptyDescription>Creá el primero para entregar con tu propio equipo.</EmptyDescription>
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
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Comercios que atiende</TableHead>
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-semibold">
                <Link href={`/motoristas/${driver.id}`} className="hover:underline">
                  {driver.name}
                </Link>
              </TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.phoneNumber}</TableCell>
              <TableCell className="whitespace-normal">
                {describeMerchants(driver)}
              </TableCell>
              <TableCell>{formatDate(driver.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
