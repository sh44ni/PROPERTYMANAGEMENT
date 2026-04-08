import crypto from 'crypto';

function getSecret() {
  return process.env.NEXTAUTH_SECRET || 'telal-super-secret-key-change-in-production';
}

export function hashOneTimeCode(code: string) {
  const normalized = code.trim();
  return crypto.createHmac('sha256', getSecret()).update(normalized).digest('hex');
}

export function newResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token: string) {
  return crypto.createHmac('sha256', getSecret()).update(token).digest('hex');
}

