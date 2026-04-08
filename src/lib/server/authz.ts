import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function requireUser(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'telal-super-secret-key-change-in-production',
  });
  if (!token) return { ok: false as const, status: 401 as const, error: 'Unauthorized' };
  return { ok: true as const, token };
}

export async function requireAdmin(request: NextRequest) {
  const res = await requireUser(request);
  if (!res.ok) return res;

  const role = (res.token as any)?.role;
  if (role !== 'admin') return { ok: false as const, status: 403 as const, error: 'Forbidden' };

  return { ok: true as const, token: res.token };
}

