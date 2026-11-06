import { describe, expect, it } from 'vitest';
import {
  calculateOrderCountFee,
  orderCountFeeRateFormSchema,
  type OrderCountFeeRate,
} from './order-count-fees.js';

const tieredRate: OrderCountFeeRate = {
  ranges: [
    { upToOrderCount: 100, fee: 30 },
    { upToOrderCount: 300, fee: 25 },
    { upToOrderCount: null, fee: 20 },
  ],
};

const freeFirstOrdersRate: OrderCountFeeRate = {
  ranges: [
    { upToOrderCount: 50, fee: 0 },
    { upToOrderCount: null, fee: 20 },
  ],
};

describe('calculateOrderCountFee', () => {
  it('charges the fee of the range the order number falls in', () => {
    expect(calculateOrderCountFee(tieredRate, 1)).toBe(30);
    expect(calculateOrderCountFee(tieredRate, 150)).toBe(25);
  });

  it('includes the upper limit in the range', () => {
    expect(calculateOrderCountFee(tieredRate, 100)).toBe(30);
    expect(calculateOrderCountFee(tieredRate, 101)).toBe(25);
  });

  it('charges the open last range for every extra order', () => {
    expect(calculateOrderCountFee(tieredRate, 5000)).toBe(20);
  });

  it('charges nothing inside a free range', () => {
    expect(calculateOrderCountFee(freeFirstOrdersRate, 50)).toBe(0);
    expect(calculateOrderCountFee(freeFirstOrdersRate, 51)).toBe(20);
  });

  it('fails for an order number that is not a whole number from 1', () => {
    expect(() => calculateOrderCountFee(tieredRate, 0)).toThrow();
    expect(() => calculateOrderCountFee(tieredRate, 1.5)).toThrow();
  });

  it('fails when the rate has no ranges', () => {
    expect(() => calculateOrderCountFee({ ranges: [] }, 1)).toThrow();
  });
});

describe('orderCountFeeRateFormSchema', () => {
  it('accepts ranges with an open last range', () => {
    expect(orderCountFeeRateFormSchema.safeParse(tieredRate).success).toBe(
      true,
    );
  });

  it('rejects a limited last range', () => {
    const result = orderCountFeeRateFormSchema.safeParse({
      ranges: [{ upToOrderCount: 100, fee: 30 }],
    });
    expect(result.error?.issues[0].path).toEqual([
      'ranges',
      0,
      'upToOrderCount',
    ]);
  });

  it('rejects limits that do not grow', () => {
    const result = orderCountFeeRateFormSchema.safeParse({
      ranges: [
        { upToOrderCount: 100, fee: 30 },
        { upToOrderCount: 100, fee: 25 },
        { upToOrderCount: null, fee: 20 },
      ],
    });
    expect(result.error?.issues[0].path).toEqual([
      'ranges',
      1,
      'upToOrderCount',
    ]);
  });

  it('rejects a fractional order count', () => {
    const result = orderCountFeeRateFormSchema.safeParse({
      ranges: [
        { upToOrderCount: 10.5, fee: 30 },
        { upToOrderCount: null, fee: 20 },
      ],
    });
    expect(result.error?.issues[0].path).toEqual([
      'ranges',
      0,
      'upToOrderCount',
    ]);
  });
});
