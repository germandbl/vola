import { z } from "zod";
import { deliveryFeeBasisSchema, feeAmountSchema } from "./delivery-fees.js";
import { phoneNumberSchema } from "./users.js";

export const OrderStatus = {
  New: "new",
  Preparing: "preparing",
  OnTheWay: "on_the_way",
  Delivered: "delivered",
  Cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const orderStatusSchema = z.enum(OrderStatus);

const MAX_ITEMS = 50;
const MAX_ITEM_QUANTITY = 999;
const CHOOSE_SUGGESTED_ADDRESS = "Elegí una dirección de las sugerencias.";
const HUNDREDTHS_PER_UNIT = 100;

const orderItemFormSchema = z.object({
  name: z.string().trim().min(1, "Escribí el producto."),
  quantity: z
    .number({ error: "Escribí la cantidad." })
    .int("Usá una cantidad entera.")
    .min(1, "La cantidad tiene que ser al menos 1.")
    .max(
      MAX_ITEM_QUANTITY,
      `La cantidad no puede pasar de ${MAX_ITEM_QUANTITY}.`,
    ),
  unitPrice: feeAmountSchema,
});

export type OrderItemForm = z.infer<typeof orderItemFormSchema>;

export const orderFormSchema = z.object({
  branchId: z
    .number({ error: "Elegí la sucursal." })
    .int()
    .positive("Elegí la sucursal."),
  customerName: z.string().trim().min(1, "Escribí el nombre del cliente."),
  customerPhone: phoneNumberSchema,
  deliveryAddress: z.string().trim().min(1, "Escribí la dirección."),
  deliveryLatitude: z.number({ error: CHOOSE_SUGGESTED_ADDRESS }),
  deliveryLongitude: z.number({ error: CHOOSE_SUGGESTED_ADDRESS }),
  items: z
    .array(orderItemFormSchema)
    .min(1, "Agregá al menos un producto.")
    .max(MAX_ITEMS, `Podés agregar hasta ${MAX_ITEMS} productos.`),
  customerDeliveryFee: feeAmountSchema,
});

export type OrderForm = z.infer<typeof orderFormSchema>;

function roundToHundredths(amount: number): number {
  return Math.round(amount * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
}

export function calculateItemTotal(item: OrderItemForm): number {
  return roundToHundredths(item.quantity * item.unitPrice);
}

export function calculateOrderSubtotal(items: OrderItemForm[]): number {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0,
  );
  return roundToHundredths(subtotal);
}

export function calculateOrderTotal(
  subtotal: number,
  customerDeliveryFee: number,
): number {
  return roundToHundredths(subtotal + customerDeliveryFee);
}

export const orderSummarySchema = z.object({
  id: z.number(),
  organizationName: z.string(),
  currency: z.string().nullable(),
  status: orderStatusSchema,
  customerName: z.string(),
  customerPhone: z.string(),
  merchantName: z.string(),
  branchName: z.string(),
  deliveryAddress: z.string(),
  total: z.number(),
  volaDeliveryFee: z.number(),
  deliveryFeeBasis: deliveryFeeBasisSchema,
  distanceKm: z.number().nullable(),
  createdAt: z.string(),
});

export type OrderSummary = z.infer<typeof orderSummarySchema>;

export const orderBranchOptionSchema = z.object({
  branchId: z.number(),
  branchName: z.string(),
  merchantName: z.string(),
  organizationName: z.string(),
  currency: z.string().nullable(),
  countryCode: z.string().nullable(),
});

export type OrderBranchOption = z.infer<typeof orderBranchOptionSchema>;
