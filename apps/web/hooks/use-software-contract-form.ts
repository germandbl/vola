import { ContractCurrency, softwareContractFormSchema, type SoftwareContract } from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import { toFieldErrors } from "@/lib/form-state";
import { saveSoftwareContract, type SoftwareContractSaveResult } from "@/lib/software-contract-actions";

export interface SoftwareContractInputs {
  currency: string;
  startPeriod: string;
  monthlyFee: string;
  includedOrders: string;
  extraOrderFee: string;
}

function findCurrentPeriod(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function toInputs(contract: SoftwareContract | null): SoftwareContractInputs {
  if (!contract) {
    return {
      currency: ContractCurrency.USD,
      startPeriod: findCurrentPeriod(),
      monthlyFee: "",
      includedOrders: "",
      extraOrderFee: "",
    };
  }
  return {
    currency: contract.currency,
    startPeriod: contract.startPeriod,
    monthlyFee: contract.monthlyFee.toString(),
    includedOrders: contract.includedOrders.toString(),
    extraOrderFee: contract.extraOrderFee.toString(),
  };
}

// Un campo vacío pasa como NaN para que la validación diga "Escribí…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

export function useSoftwareContractForm(organizationId: number, contract: SoftwareContract | null) {
  const [inputs, setInputs] = useState(() => toInputs(contract));
  const [result, setResult] = useState<SoftwareContractSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function changeInput(field: keyof SoftwareContractInputs, value: string) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = softwareContractFormSchema.safeParse({
      currency: inputs.currency,
      startPeriod: inputs.startPeriod,
      monthlyFee: toNumber(inputs.monthlyFee),
      includedOrders: toNumber(inputs.includedOrders),
      extraOrderFee: toNumber(inputs.extraOrderFee),
    });
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await saveSoftwareContract(organizationId, validation.data));
    });
  }

  return { inputs, result, isPending, changeInput, submit };
}
