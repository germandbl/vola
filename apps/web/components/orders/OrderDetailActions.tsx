"use client";

import {
  ACTIVE_ORDER_STATUSES,
  canAssignOrders,
  canManageOrders,
  canOrderDriverBeChanged,
  type AuthUser,
  type OrderDetail,
} from "@vola/shared";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { CompleteOrderDialog } from "./CompleteOrderDialog";
import { OrderPreparationButton } from "./OrderPreparationButton";
import { ReassignDriverDialog } from "./ReassignDriverDialog";
import { ReleaseDriverDialog } from "./ReleaseDriverDialog";

interface OrderDetailActionsProps {
  order: OrderDetail;
  currentUser: AuthUser;
  onUpdated: (order: OrderDetail) => void;
}

export function OrderDetailActions({ order, currentUser, onUpdated }: OrderDetailActionsProps) {
  if (!ACTIVE_ORDER_STATUSES.includes(order.status)) return null;

  const canManage = canManageOrders(currentUser, order.organizationId);
  const canChangeDriver =
    canAssignOrders(currentUser, order.organizationId) &&
    canOrderDriverBeChanged(order.status, order.driver !== null);
  if (!canManage && !canChangeDriver) return null;

  return (
    <div className="flex flex-col gap-3 border-t px-5 py-4">
      {canManage && <OrderPreparationButton order={order} onUpdated={onUpdated} />}
      {canChangeDriver && (
        <div className="flex flex-wrap gap-3">
          <ReassignDriverDialog order={order} onUpdated={onUpdated} />
          <ReleaseDriverDialog order={order} onUpdated={onUpdated} />
        </div>
      )}
      {canManage && (
        <div className="flex flex-wrap gap-3">
          <CompleteOrderDialog order={order} onUpdated={onUpdated} />
          <CancelOrderDialog order={order} onUpdated={onUpdated} />
        </div>
      )}
    </div>
  );
}
