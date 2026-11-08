"use client";

import {
  ACTIVE_ORDER_STATUSES,
  PreparationStatus,
  canManageOrders,
  findNextPreparationStatus,
  type AuthUser,
  type OrderDetail,
} from "@vola/shared";
import { ChefHat, PackageCheck } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useOrderActions } from "@/hooks/use-order-actions";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { CompleteOrderDialog } from "./CompleteOrderDialog";

interface OrderDetailActionsProps {
  order: OrderDetail;
  currentUser: AuthUser;
  onUpdated: (order: OrderDetail) => void;
}

export function OrderDetailActions({ order, currentUser, onUpdated }: OrderDetailActionsProps) {
  const actions = useOrderActions(order, onUpdated);
  const isActive = ACTIVE_ORDER_STATUSES.includes(order.status);
  if (!isActive || !canManageOrders(currentUser, order.organizationId)) return null;

  const nextPreparationStatus = findNextPreparationStatus(order.preparationStatus);

  return (
    <div className="flex flex-col gap-3 border-t px-5 py-4">
      {actions.error && <FormErrorAlert message={actions.error} />}
      <div className="flex flex-wrap gap-3">
        {nextPreparationStatus === PreparationStatus.Preparing && (
          <Button
            variant="outline"
            className="flex-1"
            disabled={actions.isPending}
            onClick={() => actions.changePreparation(PreparationStatus.Preparing)}
          >
            {actions.isPending ? <Spinner data-icon="inline-start" /> : <ChefHat data-icon="inline-start" />}
            Empezar preparación
          </Button>
        )}
        {nextPreparationStatus === PreparationStatus.Ready && (
          <Button
            variant="outline"
            className="flex-1"
            disabled={actions.isPending}
            onClick={() => actions.changePreparation(PreparationStatus.Ready)}
          >
            {actions.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <PackageCheck data-icon="inline-start" />
            )}
            Marcar lista para recoger
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <CompleteOrderDialog order={order} onUpdated={onUpdated} />
        <CancelOrderDialog order={order} onUpdated={onUpdated} />
      </div>
    </div>
  );
}
