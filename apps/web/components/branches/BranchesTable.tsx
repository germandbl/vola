import { MapPin } from "lucide-react";
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-semibold">
                <Link href={`${merchantPath}/sucursales/${branch.id}`} className="hover:underline">
                  {branch.name}
                </Link>
              </TableCell>
              <TableCell className="whitespace-normal">{branch.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
