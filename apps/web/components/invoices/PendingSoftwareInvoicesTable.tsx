import { MonitorCog } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatOrderCount, formatPeriod } from "@/lib/labels";
import { getPendingSoftwareInvoices } from "@/lib/organizations-data";
import { CreateSoftwareInvoiceDialog } from "./CreateSoftwareInvoiceDialog";

export async function PendingSoftwareInvoicesTable() {
  const pendingInvoices = await getPendingSoftwareInvoices();

  if (pendingInvoices.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MonitorCog />
          </EmptyMedia>
          <EmptyTitle>No hay meses por facturar</EmptyTitle>
          <EmptyDescription>
            Cuando cierre un mes de un cliente con contrato, su uso del software va a aparecer acá.
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
            <TableHead>Cliente</TableHead>
            <TableHead>Mes</TableHead>
            <TableHead>Órdenes</TableHead>
            <TableHead>Excedentes</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvoices.map((pendingInvoice) => (
            <TableRow key={`${pendingInvoice.organizationId}-${pendingInvoice.period}`}>
              <TableCell className="font-semibold">{pendingInvoice.organizationName}</TableCell>
              <TableCell className="first-letter:uppercase">{formatPeriod(pendingInvoice.period)}</TableCell>
              <TableCell>{formatOrderCount(pendingInvoice.orderCount)}</TableCell>
              <TableCell>{formatOrderCount(pendingInvoice.extraOrderCount)}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatMoney(pendingInvoice.subtotal, pendingInvoice.contractCurrency)}
              </TableCell>
              <TableCell className="text-right">
                <CreateSoftwareInvoiceDialog pendingInvoice={pendingInvoice} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
