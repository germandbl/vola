import { driverFormSchema, type DriverForm } from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { toFieldErrors } from "@/lib/form-state";
import { useMerchantSelection } from "./use-merchant-selection";

export type DriverTextField = "name" | "email" | "phoneNumber" | "password";

export function useDriverForm(
  save: (form: DriverForm) => Promise<DriverSaveResult>,
  allMerchantIds: number[],
) {
  const [fields, setFields] = useState<Record<DriverTextField, string>>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  // Por defecto el motorista atiende todos los comercios; el caso simple no obliga a elegir nada.
  const merchantSelection = useMerchantSelection(allMerchantIds);
  const [result, setResult] = useState<DriverSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function updateField(field: DriverTextField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = driverFormSchema.safeParse({
      ...fields,
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

  return { fields, ...merchantSelection, result, isPending, updateField, submit };
}
