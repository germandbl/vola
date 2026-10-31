import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { users } from './users.schema.js';

export type User = typeof users.$inferSelect;

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
}
