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
import { formatBillingDate, formatMoney, formatOrderCount } from "@/lib/labels";
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
          <EmptyTitle>No hay uso del software por facturar</EmptyTitle>
          <EmptyDescription>
            Cuando un cliente con contrato tenga días sin facturar, va a aparecer acá.
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
            <TableHead>Sin facturar desde</TableHead>
            <TableHead>Costo mensual</TableHead>
            <TableHead>Incluidas al mes</TableHead>
            <TableHead>Por orden excedente</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvoices.map((pendingInvoice) => (
            <TableRow key={pendingInvoice.organizationId}>
              <TableCell className="font-semibold">{pendingInvoice.organizationName}</TableCell>
              <TableCell>{formatBillingDate(pendingInvoice.nextPeriodStart)}</TableCell>
              <TableCell>{formatMoney(pendingInvoice.monthlyFee, pendingInvoice.contractCurrency)}</TableCell>
              <TableCell>{formatOrderCount(pendingInvoice.includedOrders)}</TableCell>
              <TableCell>{formatMoney(pendingInvoice.extraOrderFee, pendingInvoice.contractCurrency)}</TableCell>
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
