import { HandCoins } from "lucide-react";
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
import { getPendingDriverCash } from "@/lib/organizations-data";
import { SettleDriverCashDialog } from "./SettleDriverCashDialog";

export async function PendingDriversTable() {
  const drivers = await getPendingDriverCash();

  if (drivers.length === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoins />
          </EmptyMedia>
          <EmptyTitle>Nadie tiene efectivo por liquidar</EmptyTitle>
          <EmptyDescription>
            Cuando un motorista entregue una orden pagada en efectivo, va a aparecer acá.
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
            <TableHead>Motorista</TableHead>
            <TableHead>Órdenes</TableHead>
            <TableHead className="text-right">Efectivo en mano</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.driverId}>
              <TableCell className="font-semibold">{driver.driverName}</TableCell>
              <TableCell>{formatOrderCount(driver.orderCount)}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatMoney(driver.amount, driver.currency)}
              </TableCell>
              <TableCell className="text-right">
                <SettleDriverCashDialog driver={driver} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
