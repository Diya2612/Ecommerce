'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/profile';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#31CDD4] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#31CDD4] focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#31CDD4] focus:ring-[#31CDD4]"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                    </label>
                </div>
                <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#31CDD4] hover:text-[#28b8bf] transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-[#31CDD4] hover:text-[#28b8bf] transition-colors"
                >
                    Create account
                </Link>
            </p>
        </form>
    );
}
