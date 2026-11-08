import { MapPin } from "lucide-react";
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
import { getBranches } from "@/lib/organizations-data";

interface BranchesTableProps {
  merchantPath: string;
  merchantId: number;
}

export async function BranchesTable({ merchantPath, merchantId }: BranchesTableProps) {
  const branches = await getBranches(merchantId);

  if (branches.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPin />
          </EmptyMedia>
          <EmptyTitle>Este comercio no tiene sucursales</EmptyTitle>
          <EmptyDescription>Registrá la primera con su ubicación y horario.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sucursal</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-semibold">{branch.name}</TableCell>
              <TableCell className="whitespace-normal">{branch.address}</TableCell>
              <TableCell className="text-right">
                <ViewDetailButton href={`${merchantPath}/sucursales/${branch.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
