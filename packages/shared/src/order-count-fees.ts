import { z } from "zod";
import { MAX_FEE_RANGES, feeAmountSchema } from "./delivery-fees.js";

const MAX_ORDER_COUNT = 100_000;

const upToOrderCountSchema = z
  .number({ error: "Escribí hasta qué pedido llega el rango." })
  .int("Usá un número entero de pedidos.")
  .positive("Tiene que ser mayor que 0.")
  .max(MAX_ORDER_COUNT, `No puede pasar de ${MAX_ORDER_COUNT} pedidos.`);

export const orderCountFeeRangeSchema = z.object({
  upToOrderCount: z.number().nullable(),
  fee: z.number(),
});

export type OrderCountFeeRange = z.infer<typeof orderCountFeeRangeSchema>;

export const orderCountFeeRateSchema = z.object({
  ranges: z.array(orderCountFeeRangeSchema),
});

export type OrderCountFeeRate = z.infer<typeof orderCountFeeRateSchema>;

function findRangeLimitError(
  ranges: OrderCountFeeRange[],
  index: number,
): string | undefined {
  const { upToOrderCount } = ranges[index];
  const isLastRange = index === ranges.length - 1;
  if (isLastRange) {
    if (upToOrderCount === null) return undefined;
    return "El último rango no lleva límite: cubre todos los pedidos que siguen.";
  }
  if (upToOrderCount === null)
    return "Escribí hasta qué pedido llega este rango.";

  const previousUpToOrderCount =
    index === 0 ? 0 : ranges[index - 1].upToOrderCount;
  if (
    previousUpToOrderCount !== null &&
    upToOrderCount <= previousUpToOrderCount
  ) {
    return "Tiene que ser mayor que el límite del rango anterior.";
  }
  return undefined;
}

export const orderCountFeeRateFormSchema = z
  .object({
    ranges: z
      .array(
        z.object({
          upToOrderCount: upToOrderCountSchema.nullable(),
          fee: feeAmountSchema,
        }),
      )
      .min(1, "Agregá al menos un rango.")
      .max(MAX_FEE_RANGES, `Podés agregar hasta ${MAX_FEE_RANGES} rangos.`),
  })
  .superRefine((form, context) => {
    form.ranges.forEach((_range, index) => {
      const message = findRangeLimitError(form.ranges, index);
      if (!message) return;
      context.addIssue({
        code: "custom",
        message,
        path: ["ranges", index, "upToOrderCount"],
      });
    });
  });

export type OrderCountFeeRateForm = z.infer<typeof orderCountFeeRateFormSchema>;

// orderNumberInMonth es la posición del pedido entre los completados del comercio en el mes: el primero es el 1.
export function calculateOrderCountFee(
  rate: OrderCountFeeRate,
  orderNumberInMonth: number,
): number {
  if (!Number.isInteger(orderNumberInMonth) || orderNumberInMonth < 1) {
    throw new Error(
      `The order number in the month must be a whole number from 1, got ${orderNumberInMonth}`,
    );
  }
  const matchingRange = rate.ranges.find(
    (range) =>
      range.upToOrderCount === null ||
      orderNumberInMonth <= range.upToOrderCount,
  );
  if (!matchingRange) {
    throw new Error(
      `The order count fee rate does not cover order ${orderNumberInMonth}`,
    );
  }
  return matchingRange.fee;
}
