import {
  convertWithExchangeRate,
  invoiceRangeSchema,
  softwareInvoiceFormSchema,
  type InvoiceRange,
  type PendingSoftwareInvoice,
  type SoftwareChargeDetail,
} from "@vola/shared";
import { useRef, useState, useTransition } from "react";
import { toFieldErrors, type FieldErrors } from "@/lib/form-state";
import { createSoftwareInvoice, loadSoftwareInvoicePreview } from "@/lib/invoice-actions";

type PreviewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; charge: SoftwareChargeDetail }
  | { kind: "failed"; message?: string };

// Un campo vacío pasa como NaN para que la validación diga "Escribí la tasa…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

function findConvertedTotal(previewState: PreviewState, exchangeRate: number): number | null {
  if (previewState.kind !== "loaded") return null;
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return null;
  return convertWithExchangeRate(previewState.charge.subtotal, exchangeRate);
}

// El cobro se recalcula en el servidor con cada rango, porque depende de las órdenes entregadas en esas fechas.
export function useCreateSoftwareInvoice(pendingInvoice: PendingSoftwareInvoice) {
  const needsExchangeRate = pendingInvoice.contractCurrency !== pendingInvoice.invoiceCurrency;
  const initialRange = { from: pendingInvoice.nextPeriodStart, to: pendingInvoice.lastBillableDate };
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<InvoiceRange>(initialRange);
  const [exchangeRate, setExchangeRate] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  // Si el rango cambia antes de que responda el cálculo anterior, esa respuesta ya no sirve.
  const latestLoad = useRef(0);

  const parsedExchangeRate = needsExchangeRate ? toNumber(exchangeRate) : 1;
  const convertedTotal = findConvertedTotal(previewState, parsedExchangeRate);

  function loadPreview(nextRange: InvoiceRange) {
    const validation = invoiceRangeSchema.safeParse(nextRange);
    if (!validation.success) {
      setFieldErrors(toFieldErrors(validation.error.issues));
      setPreviewState({ kind: "idle" });
      return;
    }
    setFieldErrors({});
    setPreviewState({ kind: "loading" });
    latestLoad.current += 1;
    const loadNumber = latestLoad.current;
    loadSoftwareInvoicePreview(pendingInvoice.organizationId, validation.data).then((result) => {
      if (loadNumber !== latestLoad.current) return;
      setFieldErrors(result.fieldErrors);
      if (result.data) {
        setPreviewState({ kind: "loaded", charge: result.data });
        return;
      }
      setPreviewState({ kind: "failed", message: result.formError });
    });
  }

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setFormError(undefined);
    if (!nextIsOpen) return;
    setRange(initialRange);
    loadPreview(initialRange);
  }

  function changeRange(field: keyof InvoiceRange, value: string) {
    const nextRange = { ...range, [field]: value };
    setRange(nextRange);
    loadPreview(nextRange);
  }

  function confirm() {
    const validation = softwareInvoiceFormSchema.safeParse({
      ...range,
      exchangeRate: needsExchangeRate ? parsedExchangeRate : null,
    });
    if (!validation.success) {
      setFieldErrors(toFieldErrors(validation.error.issues));
      return;
    }
    setFormError(undefined);
    startTransition(async () => {
      const result = await createSoftwareInvoice(pendingInvoice.organizationId, validation.data);
      setFieldErrors(result.fieldErrors);
      setFormError(result.formError);
      if (result.isDone) setIsOpen(false);
    });
  }

  return {
    isOpen,
    needsExchangeRate,
    range,
    exchangeRate,
    previewState,
    convertedTotal,
    fieldErrors,
    formError,
    isPending,
    changeOpen,
    changeRange,
    setExchangeRate,
    confirm,
  };
}
