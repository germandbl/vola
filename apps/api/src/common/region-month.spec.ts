import { describe, expect, it } from 'vitest';
import {
  findNextPeriod,
  findRegionMonthRange,
  findRegionPeriod,
  findStartOfRegionMonth,
} from './region-month.js';

describe('findRegionPeriod', () => {
  it('keeps the previous month until midnight in the region', () => {
    expect(findRegionPeriod(new Date('2026-12-01T05:59:00Z'))).toBe('2026-11');
    expect(findRegionPeriod(new Date('2026-12-01T06:00:00Z'))).toBe('2026-12');
  });
});

describe('findStartOfRegionMonth', () => {
  it('starts the month at midnight in the region', () => {
    expect(findStartOfRegionMonth(new Date('2026-11-20T12:00:00Z'))).toEqual(
      new Date('2026-11-01T06:00:00Z'),
    );
  });
});

describe('findNextPeriod', () => {
  it('moves from December to January of the next year', () => {
    expect(findNextPeriod('2026-12')).toBe('2027-01');
  });
});

describe('findRegionMonthRange', () => {
  it('goes from the start of the month to the start of the next one', () => {
    expect(findRegionMonthRange('2026-02')).toEqual({
      start: new Date('2026-02-01T06:00:00Z'),
      end: new Date('2026-03-01T06:00:00Z'),
    });
  });
});
