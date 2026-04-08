import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashResetToken, newResetToken } from '@/lib/server/crypto';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as any;
  const email = String(body?.email || '').toLowerCase().trim();

  if (!email || !isValidEmail(email)) {
    // Don't leak anything; still return success-like response
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true });

  const token = newResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl.replace(/\\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: generatePasswordResetEmail({ resetLink }),
  });

  return NextResponse.json({ success: true });
}

