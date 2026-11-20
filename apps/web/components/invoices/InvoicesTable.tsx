import { FileText } from "lucide-react";
import { ListPagination } from "@/components/ListPagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatMoney, formatOrderCount } from "@/lib/labels";
import { getInvoicesPage } from "@/lib/organizations-data";

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
          <EmptyDescription>Cada factura que se genere a un comercio va a quedar registrada acá.</EmptyDescription>
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
              <TableHead>Generó</TableHead>
              <TableHead>Órdenes</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-semibold">#{invoice.id}</TableCell>
                <TableCell>{formatDateTime(invoice.createdAt)}</TableCell>
                <TableCell>{invoice.organizationName}</TableCell>
                <TableCell>{invoice.createdByName}</TableCell>
                <TableCell>{formatOrderCount(invoice.orderCount)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(invoice.amount, invoice.currency)}
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
