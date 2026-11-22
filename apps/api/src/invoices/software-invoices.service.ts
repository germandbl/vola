import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceType,
  OrderStatus,
  calculateSoftwareCharge,
  contractCurrencySchema,
  convertWithExchangeRate,
  type AuthUser,
  type PendingSoftwareInvoice,
  type SoftwareInvoiceForm,
} from '@vola/shared';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import { createFieldValidationException } from '../common/field-validation.js';
import {
  REGION_UTC_OFFSET_HOURS,
  findNextPeriod,
  findRegionMonthRange,
  findRegionPeriod,
  toPeriod,
  toPeriodStartDate,
} from '../common/region-month.js';
import { countries } from '../countries/countries.schema.js';
import {
  DATABASE,
  type Database,
  type Transaction,
} from '../database/database.module.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { softwareContracts } from '../software-contracts/software-contracts.schema.js';
import { invoices, softwareInvoiceDetails } from './invoices.schema.js';
import { assertCanInvoiceMerchants } from './pending-invoices.service.js';

const SAME_CURRENCY_EXCHANGE_RATE = 1;
const MILLIONTHS_PER_UNIT = 1_000_000;

interface ContractRow {
  organizationId: number;
  organizationName: string;
  contractCurrency: string;
  countryCurrency: string | null;
  startsOn: string;
  monthlyFee: number;
  includedOrders: number;
  extraOrderFee: number;
}

// Cuenta como uso del software toda orden entregada, la haya llevado un motorista propio o de Volá!.
// El desfase va escrito en el SQL y no como parámetro: si no, el GROUP BY no reconoce la misma expresión.
const regionDeliveryPeriod = sql<string>`to_char(
  ${orders.statusChangedAt} + make_interval(hours => ${sql.raw(String(REGION_UTC_OFFSET_HOURS))}),
  'YYYY-MM'
)`;

function toPeriodKey(organizationId: number, period: string): string {
  return `${organizationId}:${period}`;
}

// Los meses desde que empieza el contrato hasta el último mes cerrado.
function listClosedPeriods(
  startPeriod: string,
  currentPeriod: string,
): string[] {
  const periods: string[] = [];
  for (
    let period = startPeriod;
    period < currentPeriod;
    period = findNextPeriod(period)
  ) {
    periods.push(period);
  }
  return periods;
}

// Si el país del cliente no tiene moneda, la factura queda en la del contrato.
function findInvoiceCurrency(contract: ContractRow): string {
  return contract.countryCurrency ?? contract.contractCurrency;
}

function roundExchangeRate(exchangeRate: number): number {
  return Math.round(exchangeRate * MILLIONTHS_PER_UNIT) / MILLIONTHS_PER_UNIT;
}

@Injectable()
export class SoftwareInvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPending(user: AuthUser): Promise<PendingSoftwareInvoice[]> {
    assertCanInvoiceMerchants(user);
    const contracts = await this.selectContracts(this.database);
    const invoicedPeriods = await this.findInvoicedPeriods();
    const orderCounts = await this.countDeliveredOrdersByPeriod();
    const currentPeriod = findRegionPeriod(new Date());

    const pendingInvoices: PendingSoftwareInvoice[] = [];
    for (const contract of contracts) {
      const startPeriod = toPeriod(contract.startsOn);
      for (const period of listClosedPeriods(startPeriod, currentPeriod)) {
        const key = toPeriodKey(contract.organizationId, period);
        if (invoicedPeriods.has(key)) continue;
        const orderCount = orderCounts.get(key) ?? 0;
        pendingInvoices.push(
          this.toPendingInvoice(contract, period, orderCount),
        );
      }
    }
    return pendingInvoices;
  }

  // Bloquea el contrato: si dos personas facturan el mismo mes, la segunda encuentra la factura ya hecha.
  async create(
    user: AuthUser,
    organizationId: number,
    form: SoftwareInvoiceForm,
  ): Promise<void> {
    assertCanInvoiceMerchants(user);
    await this.database.transaction(async (transaction) => {
      const [contract] = await this.selectContracts(transaction)
        .where(eq(softwareContracts.organizationId, organizationId))
        .for('update', { of: softwareContracts });
      if (!contract) {
        throw new NotFoundException(
          `Organization ${organizationId} has no software contract`,
        );
      }
      this.assertPeriodIsClosed(contract, form.period);
      await this.assertPeriodNotInvoiced(
        transaction,
        organizationId,
        form.period,
      );

      const exchangeRate = this.findExchangeRate(contract, form.exchangeRate);
      const orderCount = await this.countDeliveredOrders(
        transaction,
        organizationId,
        form.period,
      );
      const charge = calculateSoftwareCharge(contract, orderCount);
      const [invoice] = await transaction
        .insert(invoices)
        .values({
          organizationId,
          type: InvoiceType.Software,
          periodStartsOn: toPeriodStartDate(form.period),
          amount: convertWithExchangeRate(charge.subtotal, exchangeRate),
          createdByUserId: user.id,
        })
        .returning({ id: invoices.id });
      await transaction.insert(softwareInvoiceDetails).values({
        invoiceId: invoice.id,
        contractCurrency: contract.contractCurrency,
        monthlyFee: contract.monthlyFee,
        includedOrders: contract.includedOrders,
        extraOrderFee: contract.extraOrderFee,
        orderCount,
        extraOrderCount: charge.extraOrderCount,
        subtotal: charge.subtotal,
        exchangeRate,
      });
    });
  }

  private selectContracts(database: Database | Transaction) {
    return database
      .select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        contractCurrency: softwareContracts.currency,
        countryCurrency: countries.currency,
        startsOn: softwareContracts.startsOn,
        monthlyFee: softwareContracts.monthlyFee,
        includedOrders: softwareContracts.includedOrders,
        extraOrderFee: softwareContracts.extraOrderFee,
      })
      .from(softwareContracts)
      .innerJoin(
        organizations,
        eq(softwareContracts.organizationId, organizations.id),
      )
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .orderBy(organizations.name)
      .$dynamic();
  }

  private async findInvoicedPeriods(): Promise<Set<string>> {
    const rows = await this.database
      .select({
        organizationId: invoices.organizationId,
        periodStartsOn: invoices.periodStartsOn,
      })
      .from(invoices)
      .where(eq(invoices.type, InvoiceType.Software));
    const keys = rows.flatMap((row) => {
      if (!row.periodStartsOn) return [];
      return [toPeriodKey(row.organizationId, toPeriod(row.periodStartsOn))];
    });
    return new Set(keys);
  }

  private async countDeliveredOrdersByPeriod(): Promise<Map<string, number>> {
    const rows = await this.database
      .select({
        organizationId: orders.organizationId,
        period: regionDeliveryPeriod,
        orderCount: count(orders.id),
      })
      .from(orders)
      .innerJoin(
        softwareContracts,
        eq(orders.organizationId, softwareContracts.organizationId),
      )
      .where(eq(orders.status, OrderStatus.Delivered))
      .groupBy(orders.organizationId, regionDeliveryPeriod);
    return new Map(
      rows.map((row) => [
        toPeriodKey(row.organizationId, row.period),
        row.orderCount,
      ]),
    );
  }

  private async countDeliveredOrders(
    transaction: Transaction,
    organizationId: number,
    period: string,
  ): Promise<number> {
    const { start, end } = findRegionMonthRange(period);
    const [{ orderCount }] = await transaction
      .select({ orderCount: count(orders.id) })
      .from(orders)
      .where(
        and(
          eq(orders.organizationId, organizationId),
          eq(orders.status, OrderStatus.Delivered),
          gte(orders.statusChangedAt, start),
          lt(orders.statusChangedAt, end),
        ),
      );
    return orderCount;
  }

  private assertPeriodIsClosed(contract: ContractRow, period: string): void {
    if (period < toPeriod(contract.startsOn)) {
      throw createFieldValidationException(
        'period',
        'El contrato empieza después de ese mes. Elegí otro.',
      );
    }
    if (period >= findRegionPeriod(new Date())) {
      throw createFieldValidationException(
        'period',
        'Ese mes todavía no cierra. Facturalo cuando termine.',
      );
    }
  }

  private async assertPeriodNotInvoiced(
    transaction: Transaction,
    organizationId: number,
    period: string,
  ): Promise<void> {
    const invoiceCount = await transaction.$count(
      invoices,
      and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.periodStartsOn, toPeriodStartDate(period)),
      ),
    );
    if (invoiceCount > 0) {
      throw new ConflictException(
        `Organization ${organizationId} already has a software invoice for ${period}`,
      );
    }
  }

  private findExchangeRate(
    contract: ContractRow,
    exchangeRate: number | null,
  ): number {
    if (contract.contractCurrency === findInvoiceCurrency(contract)) {
      return SAME_CURRENCY_EXCHANGE_RATE;
    }
    if (exchangeRate === null) {
      throw createFieldValidationException(
        'exchangeRate',
        'Escribí la tasa de cambio del día.',
      );
    }
    return roundExchangeRate(exchangeRate);
  }

  private toPendingInvoice(
    contract: ContractRow,
    period: string,
    orderCount: number,
  ): PendingSoftwareInvoice {
    const charge = calculateSoftwareCharge(contract, orderCount);
    return {
      organizationId: contract.organizationId,
      organizationName: contract.organizationName,
      period,
      orderCount,
      contractCurrency: contractCurrencySchema.parse(contract.contractCurrency),
      monthlyFee: contract.monthlyFee,
      includedOrders: contract.includedOrders,
      extraOrderFee: contract.extraOrderFee,
      extraOrderCount: charge.extraOrderCount,
      subtotal: charge.subtotal,
      invoiceCurrency: findInvoiceCurrency(contract),
    };
  }
}
