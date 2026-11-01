import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthUser, LoginRequest, LoginResponse } from '@vola/shared';
import { and, eq, gt } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { roles } from '../roles/roles.schema.js';
import { users } from '../users/users.schema.js';
import {
  UsersService,
  authUserColumns,
  toAuthUser,
} from '../users/users.service.js';
import { verifyPassword } from './passwords.js';
import { sessions } from './sessions.schema.js';

const SESSION_DURATION_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const SESSION_TOKEN_BYTES = 32;
const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect';

// Guardamos solo el hash para que alguien con acceso de lectura a la base de datos no pueda usar las sesiones.
function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly usersService: UsersService,
  ) {}

  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = await this.createSession(user.id);
    const authUser = await this.usersService.findAuthUserById(user.id);
    return { token, user: authUser };
  }

  async logout(token: string): Promise<void> {
    await this.database
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashSessionToken(token)));
  }

  async findUserBySessionToken(token: string): Promise<AuthUser | undefined> {
    const [result] = await this.database
      .select(authUserColumns)
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .innerJoin(roles, eq(users.roleId, roles.id))
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
      .where(
        and(
          eq(sessions.tokenHash, hashSessionToken(token)),
          gt(sessions.expiresAt, new Date()),
        ),
      );
    if (!result) return undefined;
    return toAuthUser(result);
  }

  private async createSession(userId: number): Promise<string> {
    const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_DAYS * MILLISECONDS_PER_DAY,
    );
    await this.database
      .insert(sessions)
      .values({ userId, tokenHash: hashSessionToken(token), expiresAt });
    return token;
  }
}
