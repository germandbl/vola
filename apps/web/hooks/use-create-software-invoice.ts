import { convertWithExchangeRate, softwareInvoiceFormSchema, type PendingSoftwareInvoice } from "@vola/shared";
import { useState, useTransition } from "react";
import { toFieldErrors } from "@/lib/form-state";
import { createSoftwareInvoice, type CreateSoftwareInvoiceResult } from "@/lib/invoice-actions";

// Un campo vacío pasa como NaN para que la validación diga "Escribí la tasa…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

export function useCreateSoftwareInvoice(pendingInvoice: PendingSoftwareInvoice) {
  const needsExchangeRate = pendingInvoice.contractCurrency !== pendingInvoice.invoiceCurrency;
  const [isOpen, setIsOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("");
  const [result, setResult] = useState<CreateSoftwareInvoiceResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  const parsedExchangeRate = needsExchangeRate ? toNumber(exchangeRate) : 1;
  const hasValidExchangeRate = Number.isFinite(parsedExchangeRate) && parsedExchangeRate > 0;
  const convertedTotal = hasValidExchangeRate
    ? convertWithExchangeRate(pendingInvoice.subtotal, parsedExchangeRate)
    : null;

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setResult({ fieldErrors: {} });
  }

  function confirm() {
    const validation = softwareInvoiceFormSchema.safeParse({
      period: pendingInvoice.period,
      exchangeRate: needsExchangeRate ? parsedExchangeRate : null,
    });
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      const createResult = await createSoftwareInvoice(pendingInvoice.organizationId, validation.data);
      setResult(createResult);
      if (createResult.isCreated) setIsOpen(false);
    });
  }

  return {
    isOpen,
    needsExchangeRate,
    exchangeRate,
    convertedTotal,
    result,
    isPending,
    changeOpen,
    setExchangeRate,
    confirm,
  };
}
