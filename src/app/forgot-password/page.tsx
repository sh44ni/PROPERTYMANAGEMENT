'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle, AlertCircle, Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      setError(isAr ? 'تعذر إرسال رابط إعادة التعيين' : 'Failed to send reset link');
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
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? 'نسيت كلمة المرور' : 'Forgot password'}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {isAr ? 'سنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : 'We’ll email you a secure reset link.'}
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
              <h2 className="text-lg font-semibold text-gray-900">{isAr ? 'تم الإرسال' : 'Email sent'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isAr
                  ? 'إذا كان البريد موجوداً، ستصلك رسالة تحتوي على رابط إعادة التعيين.'
                  : 'If the email exists, you’ll receive a password reset link shortly.'}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 mt-6 w-full py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50 focus:border-[#cea26e] transition-all duration-300 rtl:pl-4 rtl:pr-12"
                    autoComplete="email"
                    disabled={busy}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#cea26e] to-[#b8915f] hover:from-[#b8915f] hover:to-[#a67c4e] text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#cea26e]/30"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isAr ? 'إرسال رابط إعادة التعيين' : 'Send reset link'}
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

