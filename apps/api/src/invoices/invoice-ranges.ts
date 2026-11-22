import { NotFoundException } from '@nestjs/common';
import type { InvoiceRange, InvoiceType } from '@vola/shared';
import { and, eq, gte, lte, max } from 'drizzle-orm';
import { createFieldValidationException } from '../common/field-validation.js';
import { addDays, findRegionDate } from '../common/region-calendar.js';
import type { Database, Transaction } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { invoices } from './invoices.schema.js';

const dateFormatter = new Intl.DateTimeFormat('es-HN', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

// Solo se factura hasta ayer: si se facturara hoy, las órdenes que se entreguen más tarde quedarían fuera para siempre.
export function findLastBillableDate(): string {
  return addDays(findRegionDate(new Date()), -1);
}

export function assertRangeHasEnded(range: InvoiceRange): void {
  if (range.to <= findLastBillableDate()) return;
  throw createFieldValidationException(
    'to',
    'Elegí hasta ayer como máximo: el día de hoy todavía no termina.',
  );
}

// Bloquea al cliente mientras se factura: dos facturas a la vez no pueden tomar el mismo rango.
export async function lockOrganization(
  transaction: Transaction,
  organizationId: number,
): Promise<void> {
  const [organization] = await transaction
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .for('update');
  if (!organization) {
    throw new NotFoundException(`Organization ${organizationId} not found`);
  }
}

// Dos rangos se cruzan si cada uno empieza antes de que termine el otro.
export async function assertRangeNotInvoiced(
  database: Database | Transaction,
  organizationId: number,
  type: InvoiceType,
  range: InvoiceRange,
): Promise<void> {
  const [overlappingInvoice] = await database
    .select({
      id: invoices.id,
      periodStart: invoices.periodStart,
      periodEnd: invoices.periodEnd,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.type, type),
        lte(invoices.periodStart, range.to),
        gte(invoices.periodEnd, range.from),
      ),
    )
    .limit(1);
  if (!overlappingInvoice) return;
  throw createFieldValidationException(
    'from',
    `Ese rango se cruza con la factura #${overlappingInvoice.id}, del ${formatDate(overlappingInvoice.periodStart)} al ${formatDate(overlappingInvoice.periodEnd)}. Elegí fechas fuera de ese periodo.`,
  );
}

// El último día facturado de cada cliente, para sugerir desde dónde sigue el próximo rango.
export async function findLastInvoicedDates(
  database: Database,
  type: InvoiceType,
): Promise<Map<number, string>> {
  const rows = await database
    .select({
      organizationId: invoices.organizationId,
      lastPeriodEnd: max(invoices.periodEnd),
    })
    .from(invoices)
    .where(eq(invoices.type, type))
    .groupBy(invoices.organizationId);
  const lastInvoicedDates = new Map<number, string>();
  for (const row of rows) {
    if (row.lastPeriodEnd) {
      lastInvoicedDates.set(row.organizationId, row.lastPeriodEnd);
    }
  }
  return lastInvoicedDates;
}
