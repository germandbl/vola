import { hashPassword, verifyPassword } from './passwords.js';

describe('passwords', () => {
  it('accepts the password that was hashed', async () => {
    const passwordHash = await hashPassword('motorista-veloz');
    expect(await verifyPassword('motorista-veloz', passwordHash)).toBe(true);
  });

  it('rejects a different password', async () => {
    const passwordHash = await hashPassword('motorista-veloz');
    expect(await verifyPassword('otra-contraseña', passwordHash)).toBe(false);
  });

  it('produces a different hash each time for the same password', async () => {
    const firstHash = await hashPassword('motorista-veloz');
    const secondHash = await hashPassword('motorista-veloz');
    expect(firstHash).not.toBe(secondHash);
  });
});
