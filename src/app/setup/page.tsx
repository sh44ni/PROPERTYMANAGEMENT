'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, ArrowRight, Sparkles, Shield, Zap, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SetupWelcomePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState<'test' | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => setMounted(true), []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const startTestMode = async () => {
    setBusy('test');
    try {
      const res = await fetch('/api/setup/test-mode', { method: 'POST' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Failed to enter test mode');
      showToast(language === 'ar' ? 'تم تفعيل وضع التجربة' : 'Test mode enabled');
      router.push('/login');
      router.refresh();
    } catch (e: any) {
      showToast(e?.message || (language === 'ar' ? 'حدث خطأ' : 'Something went wrong'), 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#cea26e]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#cea26e]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cea26e]/5 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(206, 162, 110, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(206, 162, 110, 0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
          } text-white`}
        >
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div
        className={`w-full max-w-4xl relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Brand */}
          <div className="p-6 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#cea26e]/30 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-[#cea26e] to-[#a67c4e] p-4 rounded-2xl shadow-2xl">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Telal Al-Bidaya</h1>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'نظام إدارة العقارات' : 'Real Estate Management System'}
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
              <span className="text-[#cea26e]"> {language === 'ar' ? 'للبداية' : 'to setup'}</span>
            </h2>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {language === 'ar'
                ? 'قبل الدخول إلى النظام، اختر وضع التجربة لاستكشاف النظام بأمان، أو قم بتفعيل النظام للبدء بوضع التشغيل الكامل.'
                : 'Before entering the system, choose Test System to explore safely, or Activate to start the fully functional live mode.'}
            </p>

            <div className="mt-8 grid gap-3">
              {[
                {
                  icon: <Sparkles className="h-5 w-5 text-[#cea26e]" />,
                  title: language === 'ar' ? 'واجهة احترافية' : 'Premium experience',
                  desc: language === 'ar' ? 'تصميم حديث متوافق مع هوية المنتج.' : 'Modern UI aligned with your product branding.',
                },
                {
                  icon: <Shield className="h-5 w-5 text-[#cea26e]" />,
                  title: language === 'ar' ? 'تجربة آمنة' : 'Safe demo mode',
                  desc: language === 'ar' ? 'بيانات تجريبية معزولة.' : 'Demo data isolated from live usage.',
                },
                {
                  icon: <Zap className="h-5 w-5 text-[#cea26e]" />,
                  title: language === 'ar' ? 'تفعيل سريع' : 'Fast activation',
                  desc: language === 'ar' ? 'رمز تفعيل لمرة واحدة مع حماية ضد إعادة الاستخدام.' : 'One-time activation code with anti-reuse protection.',
                },
              ].map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-2xl bg-white/60 backdrop-blur border border-gray-200 p-4">
                  <div className="mt-0.5">{f.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-10">
            <h3 className="text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'اختر وضع البدء' : 'Choose how to start'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'ar'
                ? 'يمكنك تجربة النظام أولاً، ثم التفعيل لاحقاً.'
                : 'You can test the system first, then activate later.'}
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={startTestMode}
                disabled={busy === 'test'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {busy === 'test' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                {language === 'ar' ? 'تجربة النظام' : 'Test System'}
              </button>

              <Link
                href="/setup/activate"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#cea26e] to-[#b8915f] hover:from-[#b8915f] hover:to-[#a67c4e] text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#cea26e]/30 hover:shadow-xl hover:shadow-[#cea26e]/40"
              >
                <Sparkles className="h-5 w-5" />
                {language === 'ar' ? 'تفعيل' : 'Activate'}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">{language === 'ar' ? 'مهم:' : 'Important:'}</span>{' '}
                {language === 'ar'
                  ? 'عند التفعيل، سيتم إنهاء وضع التجربة والانتقال إلى وضع التشغيل الكامل ببيانات جديدة.'
                  : 'Activation ends test mode and starts the fully functional live state with fresh data.'}
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              © 2024 Telal Al-Bidaya LLC. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

