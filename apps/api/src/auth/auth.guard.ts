import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { AuthService } from './auth.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

function extractBearerToken(request: AuthenticatedRequest): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  if (type !== 'Bearer') return undefined;
  return token;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer session token');
    }

    const user = await this.authService.findUserBySessionToken(token);
    if (!user) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    request.user = user;
    request.sessionToken = token;
    return true;
  }
}
