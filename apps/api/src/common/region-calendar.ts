// Centroamérica (salvo Panamá) usa UTC-6 todo el año, sin horario de verano.
export const REGION_UTC_OFFSET_HOURS = -6;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
const OFFSET_MILLISECONDS = REGION_UTC_OFFSET_HOURS * MILLISECONDS_PER_HOUR;
const DATE_LENGTH = 'YYYY-MM-DD'.length;
const PERIOD_LENGTH = 'YYYY-MM'.length;

// El momento en que empieza un día ("2026-11-15") en la hora de la región.
function toRegionStart(date: string): Date {
  return new Date(
    new Date(`${date}T00:00:00Z`).getTime() - OFFSET_MILLISECONDS,
  );
}

// El día ("2026-11-15") en que cae un momento según la hora de la región.
export function findRegionDate(moment: Date): string {
  const regionMoment = new Date(moment.getTime() + OFFSET_MILLISECONDS);
  return regionMoment.toISOString().slice(0, DATE_LENGTH);
}

export function addDays(date: string, days: number): string {
  const moment = new Date(`${date}T00:00:00Z`);
  return new Date(moment.getTime() + days * MILLISECONDS_PER_DAY)
    .toISOString()
    .slice(0, DATE_LENGTH);
}

// Desde el inicio del primer día hasta el inicio del día siguiente al último.
export function findRegionDayRange(
  from: string,
  to: string,
): { start: Date; end: Date } {
  return { start: toRegionStart(from), end: toRegionStart(addDays(to, 1)) };
}

export function findStartOfRegionMonth(now: Date): Date {
  return toRegionStart(toPeriodStartDate(toPeriod(findRegionDate(now))));
}

// El mes de un contrato se guarda como su primer día: "2026-11" ↔ "2026-11-01".
export function toPeriodStartDate(period: string): string {
  return `${period}-01`;
}

export function toPeriod(date: string): string {
  return date.slice(0, PERIOD_LENGTH);
}
