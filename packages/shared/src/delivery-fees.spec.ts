import { describe, expect, it } from 'vitest';
import {
  calculateDeliveryFee,
  deliveryFeeRateFormSchema,
  type DeliveryFeeRate,
} from './delivery-fees.js';

const rangesOnlyRate: DeliveryFeeRate = {
  ranges: [
    { upToKm: 3, fee: 30 },
    { upToKm: 6, fee: 45 },
    { upToKm: null, fee: 60 },
  ],
  extraFeePerKm: null,
};

const freeRangePlusExtraKmRate: DeliveryFeeRate = {
  ranges: [{ upToKm: 3, fee: 0 }],
  extraFeePerKm: 8.5,
};

describe('calculateDeliveryFee', () => {
  it('charges the fee of the range the distance falls in', () => {
    expect(calculateDeliveryFee(rangesOnlyRate, 1.5)).toBe(30);
    expect(calculateDeliveryFee(rangesOnlyRate, 4)).toBe(45);
  });

  it('includes the upper limit in the range', () => {
    expect(calculateDeliveryFee(rangesOnlyRate, 3)).toBe(30);
  });

  it('charges the open last range for any longer distance', () => {
    expect(calculateDeliveryFee(rangesOnlyRate, 120)).toBe(60);
  });

  it('charges nothing inside a free range', () => {
    expect(calculateDeliveryFee(freeRangePlusExtraKmRate, 2.9)).toBe(0);
  });

  it('charges every started extra km', () => {
    expect(calculateDeliveryFee(freeRangePlusExtraKmRate, 3.2)).toBe(8.5);
    expect(calculateDeliveryFee(freeRangePlusExtraKmRate, 5)).toBe(17);
  });

  it('does not charge an extra km because of decimal rounding', () => {
    const rate: DeliveryFeeRate = {
      ranges: [{ upToKm: 2.15, fee: 20 }],
      extraFeePerKm: 10,
    };
    expect(calculateDeliveryFee(rate, 5.15)).toBe(50);
  });

  it('fails when the rate has no ranges', () => {
    expect(() =>
      calculateDeliveryFee({ ranges: [], extraFeePerKm: null }, 2),
    ).toThrow();
  });
});

describe('deliveryFeeRateFormSchema', () => {
  it('accepts ranges with an open last range', () => {
    expect(deliveryFeeRateFormSchema.safeParse(rangesOnlyRate).success).toBe(
      true,
    );
  });

  it('accepts a limited last range with an extra km fee', () => {
    const result = deliveryFeeRateFormSchema.safeParse(
      freeRangePlusExtraKmRate,
    );
    expect(result.success).toBe(true);
  });

  it('rejects a limited last range without an extra km fee', () => {
    const result = deliveryFeeRateFormSchema.safeParse({
      ranges: [{ upToKm: 3, fee: 30 }],
      extraFeePerKm: null,
    });
    expect(result.error?.issues[0].path).toEqual(['ranges', 0, 'upToKm']);
  });

  it('rejects an open last range with an extra km fee', () => {
    const result = deliveryFeeRateFormSchema.safeParse({
      ranges: [{ upToKm: null, fee: 30 }],
      extraFeePerKm: 8,
    });
    expect(result.error?.issues[0].path).toEqual(['ranges', 0, 'upToKm']);
  });

  it('rejects limits that do not grow', () => {
    const result = deliveryFeeRateFormSchema.safeParse({
      ranges: [
        { upToKm: 5, fee: 30 },
        { upToKm: 5, fee: 45 },
        { upToKm: null, fee: 60 },
      ],
      extraFeePerKm: null,
    });
    expect(result.error?.issues[0].path).toEqual(['ranges', 1, 'upToKm']);
  });

  it('rejects amounts with more than two decimals', () => {
    const result = deliveryFeeRateFormSchema.safeParse({
      ranges: [{ upToKm: null, fee: 30.555 }],
      extraFeePerKm: null,
    });
    expect(result.error?.issues[0].path).toEqual(['ranges', 0, 'fee']);
  });
});
