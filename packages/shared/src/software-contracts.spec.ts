import { describe, expect, it } from "vitest";
import { calculateSoftwareCharge, convertWithExchangeRate } from "./software-contracts.js";

describe("calculateSoftwareCharge", () => {
  const contract = { monthlyFee: 100, includedOrders: 100, extraOrderFee: 0.5 };

  it("charges only the monthly fee while the orders fit in the contract", () => {
    expect(calculateSoftwareCharge(contract, 80)).toEqual({ extraOrderCount: 0, subtotal: 100 });
  });

  it("charges each order over the included ones", () => {
    expect(calculateSoftwareCharge(contract, 130)).toEqual({ extraOrderCount: 30, subtotal: 115 });
  });

  it("charges every order when the contract includes none", () => {
    const perOrderContract = { monthlyFee: 0, includedOrders: 0, extraOrderFee: 0.35 };
    expect(calculateSoftwareCharge(perOrderContract, 3)).toEqual({ extraOrderCount: 3, subtotal: 1.05 });
  });
});

describe("convertWithExchangeRate", () => {
  it("rounds the converted amount to cents", () => {
    expect(convertWithExchangeRate(115, 24.7135)).toBe(2842.05);
  });
});
