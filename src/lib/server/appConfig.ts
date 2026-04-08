import { prisma } from '@/lib/prisma';

export type AppMode = 'notConfigured' | 'demo' | 'live';

export async function getAppConfig() {
  const cfg = await prisma.appConfig.findUnique({ where: { id: 'app' } });
  if (cfg) return cfg;
  return await prisma.appConfig.create({ data: { id: 'app', mode: 'notConfigured' } });
}

export async function setAppMode(mode: AppMode, data?: { activatedByEmail?: string | null; activatedAt?: Date | null }) {
  const existing = await prisma.appConfig.findUnique({ where: { id: 'app' } });
  if (!existing) {
    return prisma.appConfig.create({
      data: {
        id: 'app',
        mode,
        activatedAt: data?.activatedAt ?? null,
        activatedByEmail: data?.activatedByEmail ?? null,
      },
    });
  }
  return prisma.appConfig.update({
    where: { id: 'app' },
    data: {
      mode,
      ...(data?.activatedAt !== undefined ? { activatedAt: data.activatedAt } : null),
      ...(data?.activatedByEmail !== undefined ? { activatedByEmail: data.activatedByEmail } : null),
    },
  });
}

