import { Store } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBillingDate, formatMoney, formatOrderCount } from "@/lib/labels";
import { getPendingInvoices } from "@/lib/organizations-data";
import { CreateInvoiceDialog } from "./CreateInvoiceDialog";

export async function PendingInvoicesTable() {
  const pendingInvoices = await getPendingInvoices();

  if (pendingInvoices.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>No hay envíos por facturar</EmptyTitle>
          <EmptyDescription>
            Cuando un motorista de Volá! entregue una orden de un comercio, su envío va a aparecer acá al día siguiente.
          </EmptyDescription>
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
            <TableHead>Sin facturar desde</TableHead>
            <TableHead>Órdenes</TableHead>
            <TableHead className="text-right">Por facturar</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvoices.map((pendingInvoice) => (
            <TableRow key={pendingInvoice.organizationId}>
              <TableCell className="font-semibold">{pendingInvoice.organizationName}</TableCell>
              <TableCell>{formatBillingDate(pendingInvoice.firstDeliveryDate)}</TableCell>
              <TableCell>{formatOrderCount(pendingInvoice.orderCount)}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatMoney(pendingInvoice.amount, pendingInvoice.currency)}
              </TableCell>
              <TableCell className="text-right">
                <CreateInvoiceDialog pendingInvoice={pendingInvoice} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
