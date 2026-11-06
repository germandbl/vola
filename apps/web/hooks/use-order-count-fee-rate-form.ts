import {
  orderCountFeeRateFormSchema,
  type OrderCountFeeRate,
  type OrderCountFeeRateForm,
} from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import { saveOrderCountFeeRate, type DeliveryFeeSaveResult } from "@/lib/delivery-fee-actions";
import { toFieldErrors } from "@/lib/form-state";

export interface OrderCountRangeInput {
  key: string;
  upToOrderCount: string;
  fee: string;
}

function createRangeInput(upToOrderCount = "", fee = ""): OrderCountRangeInput {
  return { key: crypto.randomUUID(), upToOrderCount, fee };
}

function toRangeInputs(rate: OrderCountFeeRate): OrderCountRangeInput[] {
  if (rate.ranges.length === 0) return [createRangeInput()];
  return rate.ranges.map((range) =>
    createRangeInput(range.upToOrderCount?.toString() ?? "", range.fee.toString()),
  );
}

// Un campo vacío pasa como NaN para que la validación diga "Escribí…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

function toForm(ranges: OrderCountRangeInput[]): OrderCountFeeRateForm {
  const lastIndex = ranges.length - 1;
  return {
    ranges: ranges.map((range, index) => ({
      upToOrderCount: index === lastIndex ? null : toNumber(range.upToOrderCount),
      fee: toNumber(range.fee),
    })),
  };
}

export function useOrderCountFeeRateForm(organizationId: number, initialRate: OrderCountFeeRate) {
  const [ranges, setRanges] = useState(() => toRangeInputs(initialRate));
  const [result, setResult] = useState<DeliveryFeeSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function addRange() {
    setRanges((current) => [...current, createRangeInput()]);
  }

  function removeRange(key: string) {
    setRanges((current) => current.filter((range) => range.key !== key));
  }

  function updateRange(key: string, field: "upToOrderCount" | "fee", value: string) {
    setRanges((current) =>
      current.map((range) => (range.key === key ? { ...range, [field]: value } : range)),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = orderCountFeeRateFormSchema.safeParse(toForm(ranges));
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await saveOrderCountFeeRate(organizationId, validation.data));
    });
  }

  return { ranges, result, isPending, addRange, removeRange, updateRange, submit };
}
