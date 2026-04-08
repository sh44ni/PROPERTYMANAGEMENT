import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { hashResetToken } from '@/lib/server/crypto';

function validatePassword(pw: string) {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as any;
  const token = String(body?.token || '');
  const password = String(body?.password || '');

  if (!token) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  const pwError = validatePassword(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const tokenHash = hashResetToken(token);
  const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!rec) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  if (rec.usedAt) return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  if (rec.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: rec.userId }, data: { password: hashed } });
    await tx.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  });

  return NextResponse.json({ success: true });
}

