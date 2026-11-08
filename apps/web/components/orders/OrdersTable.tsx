import {
  DeliveryFeeBasis,
  canAssignOrders,
  canOrderBeAssigned,
  type AuthUser,
  type OrderSummary,
} from "@vola/shared";
import { ReceiptText } from "lucide-react";
import { ListPagination } from "@/components/ListPagination";
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
import { formatDate, formatDateTime, formatMoney } from "@/lib/labels";
import { getOrdersPage } from "@/lib/organizations-data";
import { ORDER_DETAIL_PARAM } from "@/lib/order-detail-param";
import { AssignDriverDialog } from "./AssignDriverDialog";
import { OrderStatusChip } from "./OrderStatusChip";

function describeVolaFeeBasis(order: OrderSummary): string {
  if (order.deliveryFeeBasis === DeliveryFeeBasis.Distance) return `${order.distanceKm} km`;
  return "Por cantidad de órdenes";
}

function canAssign(user: AuthUser, order: OrderSummary): boolean {
  if (!canAssignOrders(user, order.organizationId)) return false;
  return canOrderBeAssigned(order.status, order.driver !== null);
}

interface OrdersTableProps {
  page: number;
  showOrganization: boolean;
  currentUser: AuthUser;
}

export async function OrdersTable({ page, showOrganization, currentUser }: OrdersTableProps) {
  const ordersPage = await getOrdersPage(page);

  if (ordersPage.totalItems === 0) {
    return (
      <Empty className="border border-solid bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptText />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay órdenes</EmptyTitle>
          <EmptyDescription>Creá la primera para mandarla a entregar.</EmptyDescription>
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
              <TableHead>Orden</TableHead>
              {showOrganization && <TableHead>Organización</TableHead>}
              <TableHead>Cliente</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Envío Volá!</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersPage.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold">#{order.id}</TableCell>
                {showOrganization && <TableCell>{order.organizationName}</TableCell>}
                <TableCell>
                  <p>{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                </TableCell>
                <TableCell>
                  <p>{order.branchName}</p>
                  <p className="text-sm text-muted-foreground">{order.merchantName}</p>
                </TableCell>
                <TableCell className="max-w-64 truncate">{order.deliveryAddress}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(order.total, order.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <p>{formatMoney(order.volaDeliveryFee, order.currency)}</p>
                  <p className="text-sm text-muted-foreground">{describeVolaFeeBasis(order)}</p>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col items-start gap-1">
                    <OrderStatusChip status={order.status} />
                    <span className="text-sm text-muted-foreground">
                      Desde {formatDateTime(order.statusChangedAt)}
                    </span>
                    {order.cancellationReason && (
                      <span className="text-sm text-muted-foreground">
                        Motivo: {order.cancellationReason}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {canAssign(currentUser, order) ? (
                    <AssignDriverDialog orderId={order.id} />
                  ) : (
                    (order.driver?.name ?? "Sin asignar")
                  )}
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <ViewDetailButton
                    href={`/ordenes?page=${ordersPage.page}&${ORDER_DETAIL_PARAM}=${order.id}`}
                    shouldScroll={false}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        basePath="/ordenes"
        page={ordersPage.page}
        totalPages={ordersPage.totalPages}
      />
    </div>
  );
}
