import {
  deliveryFeeRateFormSchema,
  type DeliveryFeeRate,
  type DeliveryFeeRateForm,
} from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import { saveDeliveryFeeRate, type DeliveryFeeSaveResult } from "@/lib/delivery-fee-actions";
import { toFieldErrors } from "@/lib/form-state";

export interface RangeInput {
  key: string;
  upToKm: string;
  fee: string;
}

function createRangeInput(upToKm = "", fee = ""): RangeInput {
  return { key: crypto.randomUUID(), upToKm, fee };
}

function toRangeInputs(rate: DeliveryFeeRate): RangeInput[] {
  if (rate.ranges.length === 0) return [createRangeInput()];
  return rate.ranges.map((range) =>
    createRangeInput(range.upToKm?.toString() ?? "", range.fee.toString()),
  );
}

// Un campo vacío pasa como NaN para que la validación diga "Escribí…" en vez de aceptar un 0.
function toNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

function toForm(
  ranges: RangeInput[],
  hasExtraFee: boolean,
  extraFeePerKm: string,
): DeliveryFeeRateForm {
  const lastIndex = ranges.length - 1;
  return {
    ranges: ranges.map((range, index) => {
      const isOpenRange = index === lastIndex && !hasExtraFee;
      return { upToKm: isOpenRange ? null : toNumber(range.upToKm), fee: toNumber(range.fee) };
    }),
    extraFeePerKm: hasExtraFee ? toNumber(extraFeePerKm) : null,
  };
}

export function useDeliveryFeeRateForm(merchantId: number, initialRate: DeliveryFeeRate) {
  const [ranges, setRanges] = useState(() => toRangeInputs(initialRate));
  const [hasExtraFee, setHasExtraFee] = useState(initialRate.extraFeePerKm !== null);
  const [extraFeePerKm, setExtraFeePerKm] = useState(
    initialRate.extraFeePerKm?.toString() ?? "",
  );
  const [result, setResult] = useState<DeliveryFeeSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function addRange() {
    setRanges((current) => [...current, createRangeInput()]);
  }

  function removeRange(key: string) {
    setRanges((current) => current.filter((range) => range.key !== key));
  }

  function updateRange(key: string, field: "upToKm" | "fee", value: string) {
    setRanges((current) =>
      current.map((range) => (range.key === key ? { ...range, [field]: value } : range)),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = deliveryFeeRateFormSchema.safeParse(
      toForm(ranges, hasExtraFee, extraFeePerKm),
    );
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await saveDeliveryFeeRate(merchantId, validation.data));
    });
  }

  return {
    ranges,
    hasExtraFee,
    extraFeePerKm,
    result,
    isPending,
    addRange,
    removeRange,
    updateRange,
    setHasExtraFee,
    setExtraFeePerKm,
    submit,
  };
}
