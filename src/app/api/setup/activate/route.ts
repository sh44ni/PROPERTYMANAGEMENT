import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getAppConfig, setAppMode } from '@/lib/server/appConfig';
import { hashOneTimeCode } from '@/lib/server/crypto';
import { wipeDemoData } from '@/lib/server/demoSeed';
import { ensureActivationCodeExists } from '@/lib/server/activationCode';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('Include at least one uppercase letter');
  if (!/[a-z]/.test(pw)) issues.push('Include at least one lowercase letter');
  if (!/[0-9]/.test(pw)) issues.push('Include at least one number');
  return issues;
}

export async function POST(request: NextRequest) {
  const cfg = await getAppConfig();
  if (cfg.mode === 'live') return NextResponse.json({ error: 'Already activated' }, { status: 409 });

  await ensureActivationCodeExists();

  const body = await request.json().catch(() => null) as any;
  const activationCode = String(body?.activationCode || '');
  const email = String(body?.email || '').toLowerCase().trim();
  const password = String(body?.password || '');

  if (!activationCode) return NextResponse.json({ error: 'Activation code is required' }, { status: 400 });
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });

  const pwIssues = validatePassword(password);
  if (pwIssues.length) return NextResponse.json({ error: pwIssues[0], issues: pwIssues }, { status: 400 });

  const codeHash = hashOneTimeCode(activationCode);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find activation code record
      const code = await tx.activationCode.findUnique({ where: { codeHash } });
      if (!code) throw new Error('INVALID_CODE');
      if (code.isUsed) throw new Error('ALREADY_USED');
      if (code.expiresAt && code.expiresAt < new Date()) throw new Error('EXPIRED');

      // Mark used first to avoid race; then proceed.
      await tx.activationCode.update({
        where: { id: code.id },
        data: { isUsed: true, usedAt: new Date(), usedByEmail: email },
      });

      // Ensure no existing live users
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('EMAIL_EXISTS');

      // Wipe ALL app data (start fresh)
      await tx.projectDocument.deleteMany();
      await tx.document.deleteMany();
      await tx.projectUpdate.deleteMany();
      await tx.rental.deleteMany();
      await tx.transaction.deleteMany();
      await tx.rentalContract.deleteMany();
      await tx.saleContract.deleteMany();
      await tx.property.deleteMany();
      await tx.project.deleteMany();
      await tx.customer.deleteMany();
      await tx.owner.deleteMany();
      await tx.session.deleteMany();
      await tx.passwordResetToken.deleteMany();
      await tx.user.deleteMany();

      const hashed = await bcrypt.hash(password, 10);
      const user = await tx.user.create({
        data: {
          name: 'Admin',
          email,
          password: hashed,
          role: 'admin',
        },
      });

      await tx.appConfig.upsert({
        where: { id: 'app' },
        create: { id: 'app', mode: 'live', activatedAt: new Date(), activatedByEmail: email },
        update: { mode: 'live', activatedAt: new Date(), activatedByEmail: email },
      });

      return { userId: user.id };
    });

    // Outside transaction: ensure app mode set (idempotent) and best-effort wipe any leftover (noop)
    await setAppMode('live', { activatedAt: new Date(), activatedByEmail: email });
    await wipeDemoData().catch(() => {});

    return NextResponse.json({ data: { activated: true, ...result } });
  } catch (e: any) {
    const code = e?.message;
    if (code === 'INVALID_CODE') return NextResponse.json({ error: 'Invalid activation code' }, { status: 400 });
    if (code === 'ALREADY_USED') return NextResponse.json({ error: 'Activation code already used' }, { status: 400 });
    if (code === 'EXPIRED') return NextResponse.json({ error: 'Activation code expired' }, { status: 400 });
    if (code === 'EMAIL_EXISTS') return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    console.error('Activation error:', e);
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
  }
}

