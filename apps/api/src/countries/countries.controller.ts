import { Controller, Get } from '@nestjs/common';
import type { Country } from '@vola/shared';
import { CountriesService } from './countries.service.js';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  findAll(): Promise<Country[]> {
    return this.countriesService.findAll();
  }
}
