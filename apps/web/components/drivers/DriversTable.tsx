import { Bike } from "lucide-react";
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
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-semibold">{driver.name}</TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.phoneNumber}</TableCell>
              <TableCell>{formatDate(driver.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
