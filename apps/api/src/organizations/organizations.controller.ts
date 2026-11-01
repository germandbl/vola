import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  organizationFormSchema,
  paginationQuerySchema,
  type AuthUser,
  type Organization,
  type OrganizationForm,
  type Paginated,
  type PaginationQuery,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { OrganizationsService } from './organizations.service.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findPage(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<Organization>> {
    return this.organizationsService.findPage(user, query.page);
  }

  @Get(':organizationId')
  findById(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<Organization> {
    return this.organizationsService.findById(user, organizationId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(organizationFormSchema)) form: OrganizationForm,
  ): Promise<Organization> {
    return this.organizationsService.create(user, form);
  }

  @Patch(':organizationId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(organizationFormSchema)) form: OrganizationForm,
  ): Promise<Organization> {
    return this.organizationsService.update(user, organizationId, form);
  }
}
