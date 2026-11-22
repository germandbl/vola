import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  InvoiceType,
  OrderStatus,
  calculateMonthFraction,
  calculateSoftwareCharge,
  contractCurrencySchema,
  convertWithExchangeRate,
  type AuthUser,
  type InvoiceRange,
  type PendingSoftwareInvoice,
  type SoftwareChargeDetail,
  type SoftwareInvoiceForm,
} from '@vola/shared';
import { and, count, eq } from 'drizzle-orm';
import { createFieldValidationException } from '../common/field-validation.js';
import { addDays } from '../common/region-calendar.js';
import { countries } from '../countries/countries.schema.js';
import {
  DATABASE,
  type Database,
  type Transaction,
} from '../database/database.module.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { softwareContracts } from '../software-contracts/software-contracts.schema.js';
import { isDeliveredInRange } from './invoice-queries.js';
import {
  assertRangeHasEnded,
  assertRangeNotInvoiced,
  findLastBillableDate,
  findLastInvoicedDates,
  lockOrganization,
} from './invoice-ranges.js';
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

// Si el país del cliente no tiene moneda, la factura queda en la del contrato.
function findInvoiceCurrency(contract: ContractRow): string {
  return contract.countryCurrency ?? contract.contractCurrency;
}

function roundExchangeRate(exchangeRate: number): number {
  return Math.round(exchangeRate * MILLIONTHS_PER_UNIT) / MILLIONTHS_PER_UNIT;
}

// El próximo rango empieza el día después de la última factura, o cuando empieza el contrato.
function findNextPeriodStart(
  contract: ContractRow,
  lastInvoicedDate: string | undefined,
): string {
  if (!lastInvoicedDate) return contract.startsOn;
  const dayAfterLastInvoice = addDays(lastInvoicedDate, 1);
  if (dayAfterLastInvoice < contract.startsOn) return contract.startsOn;
  return dayAfterLastInvoice;
}

function assertRangeWithinContract(
  contract: ContractRow,
  range: InvoiceRange,
): void {
  if (range.from >= contract.startsOn) return;
  throw createFieldValidationException(
    'from',
    'El contrato empieza después de esa fecha. Elegí una fecha desde que rige.',
  );
}

@Injectable()
export class SoftwareInvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPending(user: AuthUser): Promise<PendingSoftwareInvoice[]> {
    assertCanInvoiceMerchants(user);
    const contracts = await this.selectContracts(this.database);
    const lastInvoicedDates = await findLastInvoicedDates(
      this.database,
      InvoiceType.Software,
    );
    const lastBillableDate = findLastBillableDate();

    const pendingInvoices: PendingSoftwareInvoice[] = [];
    for (const contract of contracts) {
      const nextPeriodStart = findNextPeriodStart(
        contract,
        lastInvoicedDates.get(contract.organizationId),
      );
      if (nextPeriodStart > lastBillableDate) continue;
      pendingInvoices.push({
        organizationId: contract.organizationId,
        organizationName: contract.organizationName,
        contractCurrency: contractCurrencySchema.parse(
          contract.contractCurrency,
        ),
        invoiceCurrency: findInvoiceCurrency(contract),
        monthlyFee: contract.monthlyFee,
        includedOrders: contract.includedOrders,
        extraOrderFee: contract.extraOrderFee,
        nextPeriodStart,
        lastBillableDate,
      });
    }
    return pendingInvoices;
  }

  // Lo que se cobraría por el rango, para mostrarlo antes de confirmar.
  async preview(
    user: AuthUser,
    organizationId: number,
    range: InvoiceRange,
  ): Promise<SoftwareChargeDetail> {
    assertCanInvoiceMerchants(user);
    assertRangeHasEnded(range);
    const contract = await this.findBillableContract(
      this.database,
      organizationId,
      range,
    );
    return this.calculateCharge(this.database, contract, range);
  }

  async create(
    user: AuthUser,
    organizationId: number,
    form: SoftwareInvoiceForm,
  ): Promise<void> {
    assertCanInvoiceMerchants(user);
    const range = { from: form.from, to: form.to };
    assertRangeHasEnded(range);
    await this.database.transaction(async (transaction) => {
      await lockOrganization(transaction, organizationId);
      const contract = await this.findBillableContract(
        transaction,
        organizationId,
        range,
      );
      const exchangeRate = this.findExchangeRate(contract, form.exchangeRate);
      const charge = await this.calculateCharge(transaction, contract, range);
      const [invoice] = await transaction
        .insert(invoices)
        .values({
          organizationId,
          type: InvoiceType.Software,
          periodStart: range.from,
          periodEnd: range.to,
          amount: convertWithExchangeRate(charge.subtotal, exchangeRate),
          createdByUserId: user.id,
        })
        .returning({ id: invoices.id });
      await transaction.insert(softwareInvoiceDetails).values({
        invoiceId: invoice.id,
        ...charge,
        exchangeRate,
      });
    });
  }

  private async findBillableContract(
    database: Database | Transaction,
    organizationId: number,
    range: InvoiceRange,
  ): Promise<ContractRow> {
    const [contract] = await this.selectContracts(database).where(
      eq(softwareContracts.organizationId, organizationId),
    );
    if (!contract) {
      throw new NotFoundException(
        `Organization ${organizationId} has no software contract`,
      );
    }
    assertRangeWithinContract(contract, range);
    await assertRangeNotInvoiced(
      database,
      organizationId,
      InvoiceType.Software,
      range,
    );
    return contract;
  }

  // Cuenta como uso del software toda orden entregada, la haya llevado un motorista propio o de Volá!.
  private async calculateCharge(
    database: Database | Transaction,
    contract: ContractRow,
    range: InvoiceRange,
  ): Promise<SoftwareChargeDetail> {
    const [{ orderCount }] = await database
      .select({ orderCount: count(orders.id) })
      .from(orders)
      .where(
        and(
          eq(orders.organizationId, contract.organizationId),
          eq(orders.status, OrderStatus.Delivered),
          isDeliveredInRange(range),
        ),
      );
    const monthFraction = calculateMonthFraction(range.from, range.to);
    const charge = calculateSoftwareCharge(contract, orderCount, monthFraction);
    return {
      contractCurrency: contractCurrencySchema.parse(contract.contractCurrency),
      monthlyFee: contract.monthlyFee,
      includedOrders: contract.includedOrders,
      extraOrderFee: contract.extraOrderFee,
      monthFraction,
      orderCount,
      ...charge,
    };
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
}
