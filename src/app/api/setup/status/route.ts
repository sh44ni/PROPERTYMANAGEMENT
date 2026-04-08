import { NextResponse } from 'next/server';
import { getAppConfig } from '@/lib/server/appConfig';
import { ensureActivationCodeExists } from '@/lib/server/activationCode';

export async function GET() {
  await ensureActivationCodeExists();
  const cfg = await getAppConfig();
  return NextResponse.json({ data: { mode: cfg.mode, activatedAt: cfg.activatedAt, activatedByEmail: cfg.activatedByEmail } });
}

