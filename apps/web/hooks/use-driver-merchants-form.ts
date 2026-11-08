import { driverMerchantsFormSchema, type DriverMerchantsForm } from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { toFieldErrors } from "@/lib/form-state";
import { useMerchantSelection } from "./use-merchant-selection";

export function useDriverMerchantsForm(
  save: (form: DriverMerchantsForm) => Promise<DriverSaveResult>,
  initialMerchantIds: number[],
) {
  const merchantSelection = useMerchantSelection(initialMerchantIds);
  const [result, setResult] = useState<DriverSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = driverMerchantsFormSchema.safeParse({
      merchantIds: merchantSelection.selectedMerchantIds,
    });
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await save(validation.data));
    });
  }

  return { ...merchantSelection, result, isPending, submit };
}
