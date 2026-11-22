// Centroamérica (salvo Panamá) usa UTC-6 todo el año, sin horario de verano.
export const REGION_UTC_OFFSET_HOURS = -6;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const OFFSET_MILLISECONDS = REGION_UTC_OFFSET_HOURS * MILLISECONDS_PER_HOUR;
const MONTHS_PER_YEAR = 12;

interface YearMonth {
  year: number;
  // 0 es enero, como en Date.
  monthIndex: number;
}

function parsePeriod(period: string): YearMonth {
  const [year, month] = period.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

function formatPeriod({ year, monthIndex }: YearMonth): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function toRegionStart({ year, monthIndex }: YearMonth): Date {
  return new Date(Date.UTC(year, monthIndex, 1) - OFFSET_MILLISECONDS);
}

export function findStartOfRegionMonth(now: Date): Date {
  return toRegionStart(parsePeriod(findRegionPeriod(now)));
}

// El mes ("2026-11") en que cae una fecha según la hora de la región.
export function findRegionPeriod(date: Date): string {
  const regionDate = new Date(date.getTime() + OFFSET_MILLISECONDS);
  return formatPeriod({
    year: regionDate.getUTCFullYear(),
    monthIndex: regionDate.getUTCMonth(),
  });
}

export function findNextPeriod(period: string): string {
  const { year, monthIndex } = parsePeriod(period);
  if (monthIndex === MONTHS_PER_YEAR - 1) {
    return formatPeriod({ year: year + 1, monthIndex: 0 });
  }
  return formatPeriod({ year, monthIndex: monthIndex + 1 });
}

// Desde el inicio del mes hasta el inicio del siguiente, en hora de la región.
export function findRegionMonthRange(period: string): {
  start: Date;
  end: Date;
} {
  return {
    start: toRegionStart(parsePeriod(period)),
    end: toRegionStart(parsePeriod(findNextPeriod(period))),
  };
}

const PERIOD_LENGTH = 'YYYY-MM'.length;

// En la base un mes se guarda como su primer día: "2026-11" ↔ "2026-11-01".
export function toPeriodStartDate(period: string): string {
  return `${period}-01`;
}

export function toPeriod(periodStartDate: string): string {
  return periodStartDate.slice(0, PERIOD_LENGTH);
}
