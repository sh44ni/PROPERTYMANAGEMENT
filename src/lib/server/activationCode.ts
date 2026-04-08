import { prisma } from '@/lib/prisma';
import { hashOneTimeCode } from '@/lib/server/crypto';

export const DEFAULT_ACTIVATION_CODE = 'PROJEKTS_TELAL_2026';

export async function ensureActivationCodeExists() {
  const existing = await prisma.activationCode.findFirst();
  if (existing) return { created: false };

  const code = process.env.ACTIVATION_CODE || DEFAULT_ACTIVATION_CODE;
  const codeHash = hashOneTimeCode(code);

  await prisma.activationCode.create({
    data: {
      codeHash,
      isUsed: false,
      notes: 'Initial activation code',
    },
  });

  return { created: true };
}

