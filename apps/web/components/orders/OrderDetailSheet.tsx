"use client";

import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useOrderDetailSheet } from "@/hooks/use-order-detail-sheet";
import { OrderDetailBody } from "./OrderDetailBody";
import { OrderDetailMap } from "./OrderDetailMap";
import { OrderStatusChip } from "./OrderStatusChip";

export function OrderDetailSheet() {
  const sheet = useOrderDetailSheet();
  const { state } = sheet;

  return (
    <Sheet open={sheet.isOpen} onOpenChange={(isOpen) => !isOpen && sheet.close()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 pt-5 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <SheetTitle className="text-lg">Orden #{sheet.orderId}</SheetTitle>
            {state.kind === "loaded" && <OrderStatusChip status={state.order.status} />}
          </div>
          <SheetDescription>
            {state.kind === "loaded" ? state.order.organizationName : "Detalle de la orden"}
          </SheetDescription>
        </SheetHeader>

        {state.kind === "loading" && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        )}
        {state.kind === "missing" && (
          <div className="p-5">
            <FormErrorAlert message="No encontramos esta orden o no tenés acceso a ella." />
          </div>
        )}
        {state.kind === "failed" && (
          <div className="p-5">
            <FormErrorAlert message="No pudimos cargar la orden. Cerrá y probá de nuevo." />
          </div>
        )}
        {state.kind === "loaded" && (
          <>
            <OrderDetailMap
              latitude={state.order.deliveryLatitude}
              longitude={state.order.deliveryLongitude}
            />
            <div className="flex-1 overflow-y-auto">
              <OrderDetailBody order={state.order} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
