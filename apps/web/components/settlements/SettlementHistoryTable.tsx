import { SETTLEMENT_TYPE_LABEL, SettlementType, type CashSettlement } from "@vola/shared";
import { History } from "lucide-react";
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
import { getSettlementHistory } from "@/lib/organizations-data";

const PLATFORM_NAME = "Volá!";

function describeGiver(settlement: CashSettlement): string {
  if (settlement.type === SettlementType.PlatformToMerchant) return PLATFORM_NAME;
  return settlement.driverName ?? "Motorista";
}

function describeReceiver(settlement: CashSettlement): string {
  if (settlement.type === SettlementType.DriverToPlatform) return PLATFORM_NAME;
  return settlement.organizationName ?? "Comercio";
}

interface SettlementHistoryTableProps {
  page: number;
}

export async function SettlementHistoryTable({ page }: SettlementHistoryTableProps) {
  const history = await getSettlementHistory(page);

  if (history.totalItems === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay liquidaciones</EmptyTitle>
          <EmptyDescription>Cada efectivo que se reciba o entregue va a quedar registrado acá.</EmptyDescription>
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
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Entregó</TableHead>
              <TableHead>Recibió</TableHead>
              <TableHead>Registró</TableHead>
              <TableHead>Órdenes</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.items.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell>{formatDateTime(settlement.createdAt)}</TableCell>
                <TableCell>{SETTLEMENT_TYPE_LABEL[settlement.type]}</TableCell>
                <TableCell>{describeGiver(settlement)}</TableCell>
                <TableCell>{describeReceiver(settlement)}</TableCell>
                <TableCell>{settlement.settledByName}</TableCell>
                <TableCell>{formatOrderCount(settlement.orderCount)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(settlement.amount, settlement.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination basePath="/liquidaciones/historial" page={page} totalPages={history.totalPages} />
    </div>
  );
}
