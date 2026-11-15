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
import { formatMoney, formatOrderCount } from "@/lib/labels";
import { getPendingMerchantCash } from "@/lib/organizations-data";
import { SettleMerchantCashDialog } from "./SettleMerchantCashDialog";

export async function PendingMerchantsTable() {
  const merchants = await getPendingMerchantCash();

  if (merchants.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>No hay efectivo por liquidar a comercios</EmptyTitle>
          <EmptyDescription>
            Cuando recibás el efectivo de un motorista de Volá!, el monto de cada comercio va a aparecer acá.
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
            <TableHead>Órdenes</TableHead>
            <TableHead className="text-right">Por liquidar</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.organizationId}>
              <TableCell className="font-semibold">{merchant.organizationName}</TableCell>
              <TableCell>{formatOrderCount(merchant.orderCount)}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatMoney(merchant.amount, merchant.currency)}
              </TableCell>
              <TableCell className="text-right">
                <SettleMerchantCashDialog merchant={merchant} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
