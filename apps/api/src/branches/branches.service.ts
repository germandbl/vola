import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  canManageMerchants,
  type AuthUser,
  type Branch,
  type BranchForm,
  type BranchSummary,
  type OpeningHours,
} from '@vola/shared';
import { and, asc, eq, ne } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { MerchantsService } from '../merchants/merchants.service.js';
import { branchOpeningHours, branches } from './branches.schema.js';

const branchSummaryColumns = {
  id: branches.id,
  merchantId: branches.merchantId,
  name: branches.name,
  address: branches.address,
  latitude: branches.latitude,
  longitude: branches.longitude,
  createdAt: branches.createdAt,
};

type BranchSummaryRow = Omit<BranchSummary, 'createdAt'> & { createdAt: Date };

const HOURS_AND_MINUTES_LENGTH = 5;

function toBranchSummary(row: BranchSummaryRow): BranchSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Postgres devuelve las horas como HH:MM:SS; el panel trabaja con HH:MM.
function toHoursAndMinutes(time: string | null): string | null {
  if (time === null) return null;
  return time.slice(0, HOURS_AND_MINUTES_LENGTH);
}

// Las sucursales son parte del comercio: las gestiona quien puede gestionar los comercios de esa organización.
function assertCanManageBranches(user: AuthUser, organizationId: number): void {
  if (!canManageMerchants(user, organizationId)) {
    throw new ForbiddenException(
      `You cannot manage the branches of organization ${organizationId}`,
    );
  }
}

@Injectable()
export class BranchesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly merchantsService: MerchantsService,
  ) {}

  async findByMerchant(
    user: AuthUser,
    merchantId: number,
  ): Promise<BranchSummary[]> {
    await this.merchantsService.findById(user, merchantId);
    const rows = await this.database
      .select(branchSummaryColumns)
      .from(branches)
      .where(eq(branches.merchantId, merchantId))
      .orderBy(asc(branches.name));
    return rows.map(toBranchSummary);
  }

  async findById(user: AuthUser, branchId: number): Promise<Branch> {
    const branch = await this.findExistingById(branchId);
    await this.merchantsService.findById(user, branch.merchantId);
    return branch;
  }

  async create(
    user: AuthUser,
    merchantId: number,
    form: BranchForm,
  ): Promise<Branch> {
    const merchant = await this.merchantsService.findById(user, merchantId);
    assertCanManageBranches(user, merchant.organizationId);
    await this.assertNameIsFree(merchantId, form.name);

    const { openingHours, ...branchData } = form;
    const branchId = await this.database.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(branches)
        .values({ ...branchData, merchantId })
        .returning({ id: branches.id });
      await transaction
        .insert(branchOpeningHours)
        .values(
          openingHours.map((hours) => ({ ...hours, branchId: created.id })),
        );
      return created.id;
    });
    return this.findExistingById(branchId);
  }

  async update(
    user: AuthUser,
    branchId: number,
    form: BranchForm,
  ): Promise<Branch> {
    const branch = await this.findExistingById(branchId);
    const merchant = await this.merchantsService.findById(
      user,
      branch.merchantId,
    );
    assertCanManageBranches(user, merchant.organizationId);
    await this.assertNameIsFree(branch.merchantId, form.name, branchId);

    const { openingHours, ...branchData } = form;
    await this.database.transaction(async (transaction) => {
      await transaction
        .update(branches)
        .set(branchData)
        .where(eq(branches.id, branchId));
      await transaction
        .delete(branchOpeningHours)
        .where(eq(branchOpeningHours.branchId, branchId));
      await transaction
        .insert(branchOpeningHours)
        .values(openingHours.map((hours) => ({ ...hours, branchId })));
    });
    return this.findExistingById(branchId);
  }

  private async findExistingById(branchId: number): Promise<Branch> {
    const [row] = await this.database
      .select(branchSummaryColumns)
      .from(branches)
      .where(eq(branches.id, branchId));
    if (!row) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }
    return {
      ...toBranchSummary(row),
      openingHours: await this.findOpeningHours(branchId),
    };
  }

  private async findOpeningHours(branchId: number): Promise<OpeningHours[]> {
    // Un enum de Postgres se ordena en el orden en que se declaró: de lunes a domingo.
    const rows = await this.database
      .select({
        day: branchOpeningHours.day,
        isOpen: branchOpeningHours.isOpen,
        opensAt: branchOpeningHours.opensAt,
        closesAt: branchOpeningHours.closesAt,
      })
      .from(branchOpeningHours)
      .where(eq(branchOpeningHours.branchId, branchId))
      .orderBy(asc(branchOpeningHours.day));
    return rows.map((row) => ({
      ...row,
      opensAt: toHoursAndMinutes(row.opensAt),
      closesAt: toHoursAndMinutes(row.closesAt),
    }));
  }

  private async assertNameIsFree(
    merchantId: number,
    name: string,
    excludedBranchId?: number,
  ): Promise<void> {
    const conditions = [
      eq(branches.merchantId, merchantId),
      eq(branches.name, name),
    ];
    if (excludedBranchId !== undefined) {
      conditions.push(ne(branches.id, excludedBranchId));
    }
    const sameNameCount = await this.database.$count(
      branches,
      and(...conditions),
    );
    if (sameNameCount > 0) {
      throw new ConflictException(
        `Merchant ${merchantId} already has a branch named ${name}`,
      );
    }
  }
}
