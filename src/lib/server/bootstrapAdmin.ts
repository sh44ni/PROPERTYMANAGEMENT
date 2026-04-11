import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setAppMode } from '@/lib/server/appConfig';

/**
 * Ensures INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD exist as the admin user and app is in live mode.
 * Runs once per server process (see instrumentation.ts).
 */
export async function ensureBootstrapAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    const anyAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (anyAdmin) {
      await setAppMode('live', { activatedAt: new Date(), activatedByEmail: anyAdmin.email });
    } else {
      console.warn(
        '[bootstrap] Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env to create the first admin.'
      );
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      name: 'Admin',
      email,
      password: hashed,
      role: 'admin',
    },
    update: {
      password: hashed,
      role: 'admin',
    },
  });

  await setAppMode('live', { activatedAt: new Date(), activatedByEmail: email });
}
