import { describe, expect, it } from "vitest";
import {
  OrderStatus,
  PreparationStatus,
  findNextPreparationStatus,
  getPreparationStatus,
  orderCancellationFormSchema,
  calculateOrderSubtotal,
  canDriverMoveTo,
  findDriverNextStatus,
  orderFormSchema,
  orderStatusChangeFormSchema,
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

describe("canDriverMoveTo", () => {
  it("moves the order one step at a time", () => {
    expect(canDriverMoveTo(OrderStatus.New, OrderStatus.HeadingToBranch)).toBe(
      true,
    );
    expect(
      canDriverMoveTo(OrderStatus.HeadingToBranch, OrderStatus.AtBranch),
    ).toBe(true);
    expect(canDriverMoveTo(OrderStatus.AtBranch, OrderStatus.OnTheWay)).toBe(
      true,
    );
    expect(canDriverMoveTo(OrderStatus.OnTheWay, OrderStatus.Delivered)).toBe(
      true,
    );
  });

  it("does not skip steps", () => {
    expect(canDriverMoveTo(OrderStatus.New, OrderStatus.Delivered)).toBe(false);
    expect(
      canDriverMoveTo(OrderStatus.HeadingToBranch, OrderStatus.OnTheWay),
    ).toBe(false);
  });

  it("only cancels an order on the way", () => {
    expect(canDriverMoveTo(OrderStatus.OnTheWay, OrderStatus.Cancelled)).toBe(
      true,
    );
    expect(canDriverMoveTo(OrderStatus.AtBranch, OrderStatus.Cancelled)).toBe(
      false,
    );
  });

  it("does not move a finished order", () => {
    expect(canDriverMoveTo(OrderStatus.Delivered, OrderStatus.Cancelled)).toBe(
      false,
    );
    expect(findDriverNextStatus(OrderStatus.Cancelled)).toBeNull();
  });
});

describe("orderStatusChangeFormSchema", () => {
  it("requires a reason to cancel", () => {
    const result = orderStatusChangeFormSchema.safeParse({
      status: OrderStatus.Cancelled,
      cancellationReason: "  ",
    });
    expect(result.error?.issues[0].path).toEqual(["cancellationReason"]);
  });
});

describe("getPreparationStatus", () => {
  it("goes from new to preparing to ready", () => {
    expect(getPreparationStatus(null, null)).toBe(PreparationStatus.New);
    expect(getPreparationStatus("2026-11-08T10:00:00Z", null)).toBe(
      PreparationStatus.Preparing,
    );
    expect(
      getPreparationStatus("2026-11-08T10:00:00Z", "2026-11-08T10:20:00Z"),
    ).toBe(PreparationStatus.Ready);
  });

  it("advances one step at a time", () => {
    expect(findNextPreparationStatus(PreparationStatus.New)).toBe(
      PreparationStatus.Preparing,
    );
    expect(findNextPreparationStatus(PreparationStatus.Ready)).toBeNull();
  });
});

describe("orderCancellationFormSchema", () => {
  it("requires a reason", () => {
    const result = orderCancellationFormSchema.safeParse({
      cancellationReason: "",
    });
    expect(result.error?.issues[0].message).toBe(
      "Escribí el motivo de la cancelación.",
    );
  });
});
