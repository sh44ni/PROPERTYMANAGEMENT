'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, Eye, EyeOff, Loader2, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

type Step = 1 | 2 | 3 | 4;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..5
}

export default function ActivateWizardPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const [activationCode, setActivationCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const strengthLabel = useMemo(() => {
    const isAr = language === 'ar';
    if (strength <= 1) return isAr ? 'ضعيف' : 'Weak';
    if (strength === 2) return isAr ? 'متوسط' : 'Fair';
    if (strength === 3) return isAr ? 'جيد' : 'Good';
    return isAr ? 'قوي' : 'Strong';
  }, [strength, language]);

  const nextFromStep1 = () => {
    setError(null);
    if (!activationCode.trim()) {
      setError(language === 'ar' ? 'رمز التفعيل مطلوب' : 'Activation code is required');
      return;
    }
    setStep(2);
  };

  const nextFromStep2 = () => {
    setError(null);
    if (!email.trim()) {
      setError(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    if (password.length < 8) {
      setError(language === 'ar' ? 'كلمة المرور يجب ألا تقل عن 8 أحرف' : 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setStep(3);
    setConfirmOpen(true);
  };

  const activate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/setup/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationCode, email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Activation failed');

      setConfirmOpen(false);
      setStep(4);
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1200);
    } catch (e: any) {
      setError(e?.message || (language === 'ar' ? 'فشل التفعيل' : 'Activation failed'));
      setConfirmOpen(false);
      setStep(2);
    } finally {
      setBusy(false);
    }
  };

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#cea26e]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#cea26e]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cea26e]/5 rounded-full blur-[150px]" />
      </div>

      <div
        className={`w-full max-w-lg relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#cea26e]/30 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-[#cea26e] to-[#a67c4e] p-4 rounded-2xl shadow-2xl">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? 'تفعيل النظام' : 'Activate System'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? 'أكمل خطوات التفعيل للانتقال للوضع الحي' : 'Complete the steps to move into live mode'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#cea26e]" />
              {isAr ? `الخطوة ${step} من 3` : `Step ${Math.min(step, 3)} of 3`}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#cea26e] transition-colors"
              onClick={() => router.push('/setup')}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isAr ? 'رجوع' : 'Back'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <ShieldAlert className="h-4 w-4" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {isAr ? 'رمز التفعيل (لمرة واحدة)' : 'One-time activation code'}
                </label>
                <Input
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder={isAr ? 'أدخل رمز التفعيل' : 'Enter activation code'}
                />
              </div>
              <Button className="w-full bg-[#cea26e] hover:bg-[#b8915f] text-white" onClick={nextFromStep1}>
                {isAr ? 'التالي' : 'Next'}
              </Button>
            </div>
          )}

          {step >= 2 && step !== 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{isAr ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <Input
                    value={password}
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cea26e]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#cea26e] to-[#a67c4e] transition-all"
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAr ? 'قوة كلمة المرور:' : 'Password strength:'} <span className="font-medium">{strengthLabel}</span>
                    <span className="ml-2 rtl:ml-0 rtl:mr-2 text-gray-400">
                      {isAr ? 'نوصي بحروف كبيرة/صغيرة وأرقام.' : 'Use upper/lowercase and numbers.'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}</label>
                <div className="relative">
                  <Input
                    value={confirmPassword}
                    type={showConfirm ? 'text' : 'password'}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cea26e]"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button className="w-full bg-[#cea26e] hover:bg-[#b8915f] text-white" onClick={nextFromStep2}>
                {isAr ? 'متابعة' : 'Continue'}
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{isAr ? 'تم التفعيل بنجاح' : 'Activation successful'}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {isAr ? 'سيتم تحويلك إلى تسجيل الدخول...' : 'Redirecting you to login...'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation modal */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isAr ? 'تأكيد التفعيل' : 'Confirm activation'}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? 'أنت على وشك نقل هذا النظام من وضع التجربة إلى الوضع الحي الكامل. بمجرد التفعيل، سينتهي وضع التجربة وسيتم إنشاء حسابك الحقيقي.'
                : 'You are about to move this system from test mode to the fully functional live state. Once activated, test mode will end and your real account will be created.'}
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={busy}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button className="bg-[#cea26e] hover:bg-[#b8915f] text-white" onClick={activate} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isAr ? 'تفعيل الآن' : 'Activate now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

