import { describe, expect, it } from 'vitest';
import {
  addDays,
  findRegionDate,
  findRegionDayRange,
  findStartOfRegionMonth,
} from './region-calendar.js';

describe('findRegionDate', () => {
  it('keeps the previous day until midnight in the region', () => {
    expect(findRegionDate(new Date('2026-12-01T05:59:00Z'))).toBe('2026-11-30');
    expect(findRegionDate(new Date('2026-12-01T06:00:00Z'))).toBe('2026-12-01');
  });
});

describe('findStartOfRegionMonth', () => {
  it('starts the month at midnight in the region', () => {
    expect(findStartOfRegionMonth(new Date('2026-11-20T12:00:00Z'))).toEqual(
      new Date('2026-11-01T06:00:00Z'),
    );
  });
});

describe('addDays', () => {
  it('moves across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('findRegionDayRange', () => {
  it('goes from the start of the first day to the start of the day after the last', () => {
    expect(findRegionDayRange('2026-11-01', '2026-11-15')).toEqual({
      start: new Date('2026-11-01T06:00:00Z'),
      end: new Date('2026-11-16T06:00:00Z'),
    });
  });
});
