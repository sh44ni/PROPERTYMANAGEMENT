'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(
        error === 'CredentialsSignin' ? 'Invalid email or password' : null
    );
    const [shake, setShake] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (!email.trim() || !password.trim()) {
            setLoginError('Please enter email and password');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setLoginError(result.error);
                setShake(true);
                setTimeout(() => setShake(false), 500);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setLoginError('An error occurred. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#cea26e]/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#cea26e]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cea26e]/5 rounded-full blur-[150px]" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(206, 162, 110, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(206, 162, 110, 0.5) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${shake ? 'animate-shake' : ''}`}>
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className={`flex justify-center mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                        <div className="relative">
                            {/* Logo with glow effect */}
                            <div className="absolute inset-0 bg-[#cea26e]/30 blur-xl rounded-full" />
                            <div className="relative bg-gradient-to-br from-[#cea26e] to-[#a67c4e] p-4 rounded-2xl shadow-2xl">
                                <Building2 className="h-12 w-12 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Telal Al-Bidaya
                    </h1>
                    <p className={`text-gray-500 text-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Real Estate Management System
                    </p>
                </div>

                {/* Login Card */}
                <div className={`bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Welcome Back</h2>

                    {loginError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#cea26e]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@telal.om"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50 focus:border-[#cea26e] transition-all duration-300"
                                    autoComplete="email"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#cea26e]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#cea26e]/50 focus:border-[#cea26e] transition-all duration-300"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cea26e] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#cea26e] to-[#b8915f] hover:from-[#b8915f] hover:to-[#a67c4e] text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#cea26e]/30 hover:shadow-xl hover:shadow-[#cea26e]/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-400 text-center mb-3">Demo Credentials</p>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Email:</span>
                                <code className="text-[#cea26e] bg-[#cea26e]/10 px-2 py-0.5 rounded font-mono text-xs">admin@telal.om</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Password:</span>
                                <code className="text-[#cea26e] bg-[#cea26e]/10 px-2 py-0.5 rounded font-mono text-xs">admin123</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className={`text-center text-xs text-gray-400 mt-8 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    © 2024 Telal Al-Bidaya LLC. All rights reserved.
                </p>
            </div>
        </div>
    );
}
