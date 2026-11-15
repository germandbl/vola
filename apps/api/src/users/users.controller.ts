import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  agentPermissionsFormSchema,
  paginationQuerySchema,
  userFormSchema,
  type AgentPermissionsForm,
  type AuthUser,
  type Paginated,
  type PaginationQuery,
  type UserForm,
  type UserSummary,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { UsersService } from './users.service.js';

@Controller('organizations/:organizationId/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findPage(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<UserSummary>> {
    return this.usersService.findPageByOrganization(
      user,
      organizationId,
      query.page,
    );
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(userFormSchema)) form: UserForm,
  ): Promise<void> {
    return this.usersService.create(user, organizationId, form);
  }

  @Put(':userId/permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePermissions(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ZodValidationPipe(agentPermissionsFormSchema))
    form: AgentPermissionsForm,
  ): Promise<void> {
    return this.usersService.updateAgentPermissions(
      user,
      organizationId,
      userId,
      form,
    );
  }
}
