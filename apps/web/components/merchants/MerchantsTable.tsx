import { Store } from "lucide-react";
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
import { getMerchants } from "@/lib/organizations-data";

interface MerchantsTableProps {
  organizationId: number;
}

export async function MerchantsTable({ organizationId }: MerchantsTableProps) {
  const merchants = await getMerchants(organizationId);

  if (merchants.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>Esta organización no tiene comercios</EmptyTitle>
          <EmptyDescription>Creá el primero para configurar sus tarifas de envío.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Comercio</TableHead>
            <TableHead>Encargado</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-semibold">
                <Link
                  href={`/organizaciones/${organizationId}/comercios/${merchant.id}`}
                  className="hover:underline"
                >
                  {merchant.name}
                </Link>
              </TableCell>
              <TableCell>{merchant.contactName}</TableCell>
              <TableCell>{merchant.contactEmail}</TableCell>
              <TableCell>{merchant.contactPhone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
