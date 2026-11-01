import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAGE_SIZE,
  canManageAllOrganizations,
  canManageOrganization,
  RoleName,
  type AuthUser,
  type Organization,
  type OrganizationForm,
  type Paginated,
} from '@vola/shared';
import { desc, eq } from 'drizzle-orm';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { countries } from '../countries/countries.schema.js';
import { CountriesService } from '../countries/countries.service.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from './organizations.schema.js';

const organizationColumns = {
  id: organizations.id,
  name: organizations.name,
  type: organizations.type,
  countryId: organizations.countryId,
  countryName: countries.name,
  createdAt: organizations.createdAt,
};

type OrganizationRow = {
  id: number;
  name: string;
  type: Organization['type'];
  countryId: number | null;
  countryName: string | null;
  createdAt: Date;
};

function toOrganization(row: OrganizationRow): Organization {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function assertIsSuperadmin(user: AuthUser): void {
  if (user.role !== RoleName.Superadmin) {
    throw new ForbiddenException('Only a superadmin can do this');
  }
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly countriesService: CountriesService,
  ) {}

  async findPage(
    user: AuthUser,
    page: number,
  ): Promise<Paginated<Organization>> {
    if (!canManageAllOrganizations(user)) {
      throw new ForbiddenException('You cannot list all organizations');
    }

    const rows = await this.database
      .select(organizationColumns)
      .from(organizations)
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .orderBy(desc(organizations.createdAt), desc(organizations.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(organizations);
    return toPaginated(rows.map(toOrganization), page, totalItems);
  }

  async findById(
    user: AuthUser,
    organizationId: number,
  ): Promise<Organization> {
    if (!canManageOrganization(user, organizationId)) {
      throw new ForbiddenException(
        `You cannot access organization ${organizationId}`,
      );
    }
    return this.findExistingById(organizationId);
  }

  async create(user: AuthUser, form: OrganizationForm): Promise<Organization> {
    assertIsSuperadmin(user);
    await this.assertCountryExists(form.countryId);

    const [created] = await this.database
      .insert(organizations)
      .values(form)
      .returning({ id: organizations.id });
    return this.findExistingById(created.id);
  }

  async update(
    user: AuthUser,
    organizationId: number,
    form: OrganizationForm,
  ): Promise<Organization> {
    assertIsSuperadmin(user);
    await this.findExistingById(organizationId);
    await this.assertCountryExists(form.countryId);

    await this.database
      .update(organizations)
      .set(form)
      .where(eq(organizations.id, organizationId));
    return this.findExistingById(organizationId);
  }

  private async findExistingById(
    organizationId: number,
  ): Promise<Organization> {
    const [row] = await this.database
      .select(organizationColumns)
      .from(organizations)
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(eq(organizations.id, organizationId));
    if (!row) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
    return toOrganization(row);
  }

  private async assertCountryExists(countryId: number): Promise<void> {
    const countryExists = await this.countriesService.existsById(countryId);
    if (!countryExists) {
      throw new BadRequestException(`Country ${countryId} does not exist`);
    }
  }
}
