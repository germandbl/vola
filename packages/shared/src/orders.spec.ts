import { describe, expect, it } from "vitest";
import {
  calculateOrderSubtotal,
  orderFormSchema,
  type OrderForm,
} from "./orders.js";

function createOrderForm(): OrderForm {
  return {
    branchId: 1,
    customerName: "Karla Mejía",
    customerPhone: "+50499998888",
    deliveryAddress: "Col. Palmira, casa 12",
    deliveryLatitude: 14.0989,
    deliveryLongitude: -87.1907,
    items: [{ name: "Baleada sencilla", quantity: 3, unitPrice: 25 }],
    customerDeliveryFee: 40,
  };
}

describe("orderFormSchema", () => {
  it("accepts a complete order", () => {
    expect(orderFormSchema.safeParse(createOrderForm()).success).toBe(true);
  });

  it("rejects an order without phone", () => {
    const result = orderFormSchema.safeParse({
      ...createOrderForm(),
      customerPhone: "",
    });
    expect(result.error?.issues[0].path).toEqual(["customerPhone"]);
  });

  it("rejects an address that was not chosen from the suggestions", () => {
    const result = orderFormSchema.safeParse({
      ...createOrderForm(),
      deliveryLatitude: undefined,
      deliveryLongitude: undefined,
    });
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      "deliveryLatitude",
      "deliveryLongitude",
    ]);
  });

  it("rejects an order without products", () => {
    const result = orderFormSchema.safeParse({
      ...createOrderForm(),
      items: [],
    });
    expect(result.error?.issues[0].path).toEqual(["items"]);
  });
});

describe("calculateOrderSubtotal", () => {
  it("adds quantity times price of every product", () => {
    expect(
      calculateOrderSubtotal([
        { name: "Baleada sencilla", quantity: 3, unitPrice: 25 },
        { name: "Licuado", quantity: 2, unitPrice: 0.1 },
      ]),
    ).toBe(75.2);
  });
});
