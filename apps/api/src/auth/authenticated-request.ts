import type { Request } from 'express';
import type { AuthUser } from '@vola/shared';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  sessionToken: string;
}
