import { Inject, Injectable } from '@nestjs/common';
import type { Country } from '@vola/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { countries } from './countries.schema.js';

@Injectable()
export class CountriesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  findAll(): Promise<Country[]> {
    return this.database
      .select({
        id: countries.id,
        name: countries.name,
        code: countries.code,
        currency: countries.currency,
      })
      .from(countries)
      .orderBy(asc(countries.name));
  }

  async existsById(countryId: number): Promise<boolean> {
    const count = await this.database.$count(
      countries,
      eq(countries.id, countryId),
    );
    return count > 0;
  }
}
