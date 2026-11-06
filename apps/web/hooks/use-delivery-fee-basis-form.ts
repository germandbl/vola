import { deliveryFeeBasisSchema, type DeliveryFeeBasis } from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import { saveDeliveryFeeBasis, type DeliveryFeeSaveResult } from "@/lib/delivery-fee-actions";

export function useDeliveryFeeBasisForm(
  organizationId: number,
  initialBasis: DeliveryFeeBasis | null,
) {
  const [selectedBasis, setSelectedBasis] = useState(initialBasis);
  const [result, setResult] = useState<DeliveryFeeSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();
  const hasChanges = selectedBasis !== null && selectedBasis !== initialBasis;

  function selectBasis(value: string) {
    setSelectedBasis(deliveryFeeBasisSchema.parse(value));
    setResult({ fieldErrors: {} });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedBasis === null) return;
    startTransition(async () => {
      setResult(await saveDeliveryFeeBasis(organizationId, { basis: selectedBasis }));
    });
  }

  return { selectedBasis, result, isPending, hasChanges, selectBasis, submit };
}
