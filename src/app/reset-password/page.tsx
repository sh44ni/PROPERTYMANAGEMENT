'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function strengthScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const strength = useMemo(() => strengthScore(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(isAr ? 'رمز غير صالح' : 'Invalid token');
      return;
    }
    if (password.length < 8) {
      setError(isAr ? 'كلمة المرور قصيرة جداً' : 'Password too short');
      return;
    }
    if (password !== confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Reset failed');
      setDone(true);
    } catch (e: any) {
      setError(e?.message || (isAr ? 'فشل إعادة التعيين' : 'Reset failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#cea26e]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#cea26e]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div
        className={`w-full max-w-md relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#cea26e]/30 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-[#cea26e] to-[#a67c4e] p-4 rounded-2xl shadow-2xl">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {isAr ? 'اختر كلمة مرور جديدة لحسابك.' : 'Choose a new password for your account.'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{isAr ? 'تم بنجاح' : 'Success'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isAr ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' : 'You can now sign in with your new password.'}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 mt-6 w-full py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {isAr ? 'تسجيل الدخول' : 'Sign in'}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{isAr ? 'كلمة المرور الجديدة' : 'New password'}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50 focus:border-[#cea26e] transition-all duration-300"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cea26e]"
                    tabIndex={-1}
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#cea26e] to-[#a67c4e]" style={{ width: `${(strength / 5) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAr ? 'الإرشاد:' : 'Guidance:'} {isAr ? '8 أحرف على الأقل.' : 'At least 8 characters.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}</label>
                <div className="relative">
                  <input
                    type={show2 ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50 focus:border-[#cea26e] transition-all duration-300"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShow2((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cea26e]"
                    tabIndex={-1}
                  >
                    {show2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#cea26e] to-[#b8915f] hover:from-[#b8915f] hover:to-[#a67c4e] text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#cea26e]/30"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isAr ? 'تأكيد' : 'Confirm'}
              </button>

              <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-[#cea26e] transition-colors">
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

