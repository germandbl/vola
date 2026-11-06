import { z } from "zod";

export const DeliveryFeeBasis = {
  Distance: "distance",
  CompletedOrders: "completed_orders",
} as const;

export type DeliveryFeeBasis =
  (typeof DeliveryFeeBasis)[keyof typeof DeliveryFeeBasis];

export const deliveryFeeBasisSchema = z.enum(DeliveryFeeBasis);

export const deliveryFeeBasisFormSchema = z.object({
  basis: z.enum(DeliveryFeeBasis, { error: "Elegí cómo se cobra el envío." }),
});

export type DeliveryFeeBasisForm = z.infer<typeof deliveryFeeBasisFormSchema>;

export const deliveryFeeBasisSettingSchema = z.object({
  basis: deliveryFeeBasisSchema.nullable(),
});

export type DeliveryFeeBasisSetting = z.infer<
  typeof deliveryFeeBasisSettingSchema
>;

const MAX_DELIVERY_FEE = 1_000_000;
const MAX_DISTANCE_KM = 500;
export const MAX_FEE_RANGES = 20;
const HUNDREDTH = 0.01;
const HUNDREDTHS_PER_UNIT = 100;

export const feeAmountSchema = z
  .number({ error: "Escribí un monto." })
  .nonnegative("El monto no puede ser negativo.")
  .max(MAX_DELIVERY_FEE, `El monto no puede pasar de ${MAX_DELIVERY_FEE}.`)
  .multipleOf(HUNDREDTH, "Usá hasta dos decimales.");

const upToKmSchema = z
  .number({ error: "Escribí hasta qué km llega el rango." })
  .positive("Los km tienen que ser mayores que 0.")
  .max(MAX_DISTANCE_KM, `Los km no pueden pasar de ${MAX_DISTANCE_KM}.`)
  .multipleOf(HUNDREDTH, "Usá hasta dos decimales.");

export const deliveryFeeRangeSchema = z.object({
  upToKm: z.number().nullable(),
  fee: z.number(),
});

export type DeliveryFeeRange = z.infer<typeof deliveryFeeRangeSchema>;

export const deliveryFeeRateSchema = z.object({
  ranges: z.array(deliveryFeeRangeSchema),
  extraFeePerKm: z.number().nullable(),
});

export type DeliveryFeeRate = z.infer<typeof deliveryFeeRateSchema>;

function findRangeLimitError(
  ranges: DeliveryFeeRange[],
  index: number,
  hasExtraFee: boolean,
): string | undefined {
  const { upToKm } = ranges[index];
  const isLastRange = index === ranges.length - 1;
  if (isLastRange && !hasExtraFee) {
    if (upToKm === null) return undefined;
    return "Sin cobro por km extra, el último rango no lleva límite.";
  }
  if (upToKm === null) return "Escribí hasta qué km llega este rango.";

  const previousUpToKm = index === 0 ? 0 : ranges[index - 1].upToKm;
  if (previousUpToKm !== null && upToKm <= previousUpToKm) {
    return "Tiene que ser mayor que el límite del rango anterior.";
  }
  return undefined;
}

export const deliveryFeeRateFormSchema = z
  .object({
    ranges: z
      .array(
        z.object({ upToKm: upToKmSchema.nullable(), fee: feeAmountSchema }),
      )
      .min(1, "Agregá al menos un rango.")
      .max(MAX_FEE_RANGES, `Podés agregar hasta ${MAX_FEE_RANGES} rangos.`),
    extraFeePerKm: feeAmountSchema.nullable(),
  })
  .superRefine((form, context) => {
    const hasExtraFee = form.extraFeePerKm !== null;
    form.ranges.forEach((_range, index) => {
      const message = findRangeLimitError(form.ranges, index, hasExtraFee);
      if (!message) return;
      context.addIssue({
        code: "custom",
        message,
        path: ["ranges", index, "upToKm"],
      });
    });
  });

export type DeliveryFeeRateForm = z.infer<typeof deliveryFeeRateFormSchema>;

// Restamos en centésimas porque con decimales 5.15 - 2.15 da 3.0000000000000004 y cobraría un km de más.
function countStartedExtraKm(distanceKm: number, upToKm: number): number {
  const extraHundredths =
    Math.round(distanceKm * HUNDREDTHS_PER_UNIT) -
    Math.round(upToKm * HUNDREDTHS_PER_UNIT);
  return Math.ceil(extraHundredths / HUNDREDTHS_PER_UNIT);
}

function roundToHundredths(amount: number): number {
  return Math.round(amount * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
}

function calculateFeeBeyondLastRange(
  rate: DeliveryFeeRate,
  distanceKm: number,
): number {
  const lastRange = rate.ranges.at(-1);
  if (!lastRange || lastRange.upToKm === null || rate.extraFeePerKm === null) {
    throw new Error(`The delivery fee rate does not cover ${distanceKm} km`);
  }
  const extraKm = countStartedExtraKm(distanceKm, lastRange.upToKm);
  return roundToHundredths(lastRange.fee + extraKm * rate.extraFeePerKm);
}

export function calculateDeliveryFee(
  rate: DeliveryFeeRate,
  distanceKm: number,
): number {
  const matchingRange = rate.ranges.find(
    (range) => range.upToKm === null || distanceKm <= range.upToKm,
  );
  if (matchingRange) return matchingRange.fee;
  return calculateFeeBeyondLastRange(rate, distanceKm);
}
