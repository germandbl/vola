import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  branchFormSchema,
  type AuthUser,
  type Branch,
  type BranchForm,
  type BranchSummary,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { BranchesService } from './branches.service.js';

@Controller()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get('merchants/:merchantId/branches')
  findByMerchant(
    @CurrentUser() user: AuthUser,
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ): Promise<BranchSummary[]> {
    return this.branchesService.findByMerchant(user, merchantId);
  }

  @Post('merchants/:merchantId/branches')
  create(
    @CurrentUser() user: AuthUser,
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(new ZodValidationPipe(branchFormSchema)) form: BranchForm,
  ): Promise<Branch> {
    return this.branchesService.create(user, merchantId, form);
  }

  @Get('branches/:branchId')
  findById(
    @CurrentUser() user: AuthUser,
    @Param('branchId', ParseIntPipe) branchId: number,
  ): Promise<Branch> {
    return this.branchesService.findById(user, branchId);
  }

  @Patch('branches/:branchId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body(new ZodValidationPipe(branchFormSchema)) form: BranchForm,
  ): Promise<Branch> {
    return this.branchesService.update(user, branchId, form);
  }
}
