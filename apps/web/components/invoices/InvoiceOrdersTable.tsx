import type { InvoiceOrder } from "@vola/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatMoney } from "@/lib/labels";

interface InvoiceOrdersTableProps {
  orders: InvoiceOrder[];
  amount: number;
  currency: string | null;
}

export function InvoiceOrdersTable({ orders, amount, currency }: InvoiceOrdersTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Comercio</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Entregada</TableHead>
            <TableHead className="text-right">Envío</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-semibold">#{order.id}</TableCell>
              <TableCell>{order.merchantName}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{formatDateTime(order.deliveredAt)}</TableCell>
              <TableCell className="text-right">{formatMoney(order.deliveryFee, order.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="font-semibold">
              Total
            </TableCell>
            <TableCell className="text-right font-semibold">{formatMoney(amount, currency)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
