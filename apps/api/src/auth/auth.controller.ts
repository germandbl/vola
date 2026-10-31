import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  loginSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
} from '@vola/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new ZodValidationPipe(loginSchema)) loginRequest: LoginRequest,
  ): Promise<LoginResponse> {
    return this.authService.login(loginRequest);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() request: AuthenticatedRequest): Promise<void> {
    return this.authService.logout(request.sessionToken);
  }

  @Get('me')
  findCurrentUser(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
