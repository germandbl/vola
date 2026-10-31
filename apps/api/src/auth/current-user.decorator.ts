import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@vola/shared';
import type { AuthenticatedRequest } from './authenticated-request.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
