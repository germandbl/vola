import { describe, expect, it } from "vitest";
import {
  calculateMonthFraction,
  calculateSoftwareCharge,
  convertWithExchangeRate,
} from "./software-contracts.js";

describe("calculateMonthFraction", () => {
  it("counts a whole month as 1", () => {
    expect(calculateMonthFraction("2026-02-01", "2026-02-28")).toBe(1);
  });

  it("counts half of a 30-day month as 0.5", () => {
    expect(calculateMonthFraction("2026-11-01", "2026-11-15")).toBe(0.5);
  });

  it("adds the part of each month the range covers", () => {
    // 17 de 31 días de enero más 14 de 28 de febrero.
    expect(calculateMonthFraction("2026-01-15", "2026-02-14")).toBe(1.048387);
  });
});

describe("calculateSoftwareCharge", () => {
  const contract = { monthlyFee: 100, includedOrders: 100, extraOrderFee: 0.5 };

  it("charges only the monthly fee while the orders fit in the contract", () => {
    expect(calculateSoftwareCharge(contract, 80, 1)).toEqual({
      proratedMonthlyFee: 100,
      proratedIncludedOrders: 100,
      extraOrderCount: 0,
      subtotal: 100,
    });
  });

  it("charges each order over the included ones", () => {
    expect(calculateSoftwareCharge(contract, 130, 1).subtotal).toBe(115);
  });

  it("prorates the fee and the included orders, rounding the orders down", () => {
    expect(calculateSoftwareCharge(contract, 60, 0.333333)).toEqual({
      proratedMonthlyFee: 33.33,
      proratedIncludedOrders: 33,
      extraOrderCount: 27,
      subtotal: 46.83,
    });
  });

  it("charges every order when the contract includes none", () => {
    const perOrderContract = { monthlyFee: 0, includedOrders: 0, extraOrderFee: 0.35 };
    expect(calculateSoftwareCharge(perOrderContract, 3, 0.5).subtotal).toBe(1.05);
  });
});

describe("convertWithExchangeRate", () => {
  it("rounds the converted amount to cents", () => {
    expect(convertWithExchangeRate(115, 24.7135)).toBe(2842.05);
  });
});
