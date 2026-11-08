"use client";

import { PreparationStatus, findNextPreparationStatus, type OrderDetail } from "@vola/shared";
import { ChefHat, PackageCheck } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useOrderActions } from "@/hooks/use-order-actions";

interface OrderPreparationButtonProps {
  order: OrderDetail;
  onUpdated: (order: OrderDetail) => void;
}

export function OrderPreparationButton({ order, onUpdated }: OrderPreparationButtonProps) {
  const actions = useOrderActions(order, onUpdated);
  const nextPreparationStatus = findNextPreparationStatus(order.preparationStatus);
  if (!nextPreparationStatus) return null;

  const isStarting = nextPreparationStatus === PreparationStatus.Preparing;
  const Icon = isStarting ? ChefHat : PackageCheck;
  const targetStatus = isStarting ? PreparationStatus.Preparing : PreparationStatus.Ready;

  return (
    <>
      {actions.error && <FormErrorAlert message={actions.error} />}
      <Button
        variant="outline"
        disabled={actions.isPending}
        onClick={() => actions.changePreparation(targetStatus)}
      >
        {actions.isPending ? <Spinner data-icon="inline-start" /> : <Icon data-icon="inline-start" />}
        {isStarting ? "Empezar preparación" : "Marcar lista para recoger"}
      </Button>
    </>
  );
}
