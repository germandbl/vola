import { Store } from "lucide-react";
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
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-semibold">{merchant.name}</TableCell>
              <TableCell>{merchant.contactName}</TableCell>
              <TableCell>{merchant.contactEmail}</TableCell>
              <TableCell>{merchant.contactPhone}</TableCell>
              <TableCell className="text-right">
                <ViewDetailButton
                  href={`/organizaciones/${organizationId}/comercios/${merchant.id}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
