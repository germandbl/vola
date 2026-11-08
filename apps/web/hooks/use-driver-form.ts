import {
  canDriverServeMerchant,
  driverFormSchema,
  type DriverForm,
  type DriverMerchant,
  type DriverOwner,
} from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { toFieldErrors } from "@/lib/form-state";
import { useMerchantSelection } from "./use-merchant-selection";

export type DriverTextField = "name" | "email" | "phoneNumber" | "password";

// Un motorista de cliente atiende por defecto todos sus comercios; uno de Volá! arranca sin ninguno para elegir a quién atiende.
function findDefaultMerchantIds(owner: DriverOwner, merchants: DriverMerchant[]): number[] {
  if (owner.isPlatform) return [];
  return merchants
    .filter((merchant) => merchant.organizationId === owner.id)
    .map((merchant) => merchant.id);
}

export function useDriverForm(
  save: (form: DriverForm) => Promise<DriverSaveResult>,
  owners: DriverOwner[],
  merchants: DriverMerchant[],
) {
  const [fields, setFields] = useState<Record<DriverTextField, string>>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [owner, setOwner] = useState(owners[0]);
  const merchantSelection = useMerchantSelection(findDefaultMerchantIds(owners[0], merchants));
  const [result, setResult] = useState<DriverSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();
  const servableMerchants = merchants.filter((merchant) => canDriverServeMerchant(owner, merchant));

  function updateField(field: DriverTextField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function selectOwner(ownerId: string) {
    const selectedOwner = owners.find((candidate) => candidate.id.toString() === ownerId);
    if (!selectedOwner) return;
    setOwner(selectedOwner);
    merchantSelection.setSelectedMerchantIds(findDefaultMerchantIds(selectedOwner, merchants));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = driverFormSchema.safeParse({
      ...fields,
      organizationId: owner.id,
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

  return {
    fields,
    owner,
    servableMerchants,
    selectedMerchantIds: merchantSelection.selectedMerchantIds,
    toggleMerchants: merchantSelection.toggleMerchants,
    result,
    isPending,
    updateField,
    selectOwner,
    submit,
  };
}
