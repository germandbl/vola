import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  softwareContractFormSchema,
  type AuthUser,
  type SoftwareContractForm,
  type SoftwareContractSetting,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { SoftwareContractsService } from './software-contracts.service.js';

@Controller('organizations/:organizationId/software-contract')
export class SoftwareContractsController {
  constructor(
    private readonly softwareContractsService: SoftwareContractsService,
  ) {}

  @Get()
  find(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<SoftwareContractSetting> {
    return this.softwareContractsService.findByOrganization(
      user,
      organizationId,
    );
  }

  @Put()
  save(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(softwareContractFormSchema))
    form: SoftwareContractForm,
  ): Promise<SoftwareContractSetting> {
    return this.softwareContractsService.save(user, organizationId, form);
  }
}
