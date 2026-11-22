import { INVOICE_TYPE_LABEL } from "@vola/shared";
import { FileText } from "lucide-react";
import { ListPagination } from "@/components/ListPagination";
import { ViewDetailButton } from "@/components/ViewDetailButton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateRange, formatDateTime, formatMoney, formatOrderCount } from "@/lib/labels";
import { getInvoicesPage } from "@/lib/organizations-data";
import { InvoiceStatusChip } from "./InvoiceStatusChip";

interface InvoicesTableProps {
  page: number;
}

export async function InvoicesTable({ page }: InvoicesTableProps) {
  const invoices = await getInvoicesPage(page);

  if (invoices.totalItems === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay facturas</EmptyTitle>
          <EmptyDescription>Cada factura de envíos o de uso del software va a quedar registrada acá.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Comercio</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Generó</TableHead>
              <TableHead>Órdenes</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-semibold">#{invoice.id}</TableCell>
                <TableCell>{formatDateTime(invoice.createdAt)}</TableCell>
                <TableCell>{invoice.organizationName}</TableCell>
                <TableCell>{INVOICE_TYPE_LABEL[invoice.type]}</TableCell>
                <TableCell>{formatDateRange(invoice.periodStart, invoice.periodEnd)}</TableCell>
                <TableCell>{invoice.createdByName}</TableCell>
                <TableCell>{formatOrderCount(invoice.orderCount)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(invoice.amount, invoice.currency)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusChip paidAt={invoice.paidAt} />
                </TableCell>
                <TableCell className="text-right">
                  <ViewDetailButton href={`/facturas/${invoice.id}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination basePath="/facturas" page={page} totalPages={invoices.totalPages} />
    </div>
  );
}
