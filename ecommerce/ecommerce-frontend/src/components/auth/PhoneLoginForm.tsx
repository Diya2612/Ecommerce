'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, ArrowLeft, CheckCircle } from 'lucide-react';

type Step = 'phone' | 'otp';

export function PhoneLoginForm() {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { signInWithPhone, verifyPhoneOtp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const otpInputRef = useRef<HTMLInputElement>(null);

    // Format phone number with country code
    const formatPhoneNumber = (value: string): string => {
        // Remove all non-digit characters except +
        const cleaned = value.replace(/[^\d+]/g, '');
        // Ensure it starts with +91 for India
        if (!cleaned.startsWith('+')) {
            return '+91' + cleaned;
        }
        return cleaned;
    };

    // Handle phone submission
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const formattedPhone = formatPhoneNumber(phone);

        if (formattedPhone.length < 12) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        const { error } = await signInWithPhone(formattedPhone);

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Move to OTP step
        setPhone(formattedPhone);
        setStep('otp');
        setIsLoading(false);
        setResendCooldown(60);
    };

    // Handle OTP verification
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setIsLoading(true);

        const { error } = await verifyPhoneOtp(phone, otp);

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Success - redirect to original page or profile
        router.push(redirectTo);
        router.refresh();
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setError(null);
        setIsLoading(true);

        const { error } = await signInWithPhone(phone);

        if (error) {
            setError(error.message);
        } else {
            setResendCooldown(60);
        }

        setIsLoading(false);
    };

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-focus OTP input
    useEffect(() => {
        if (step === 'otp' && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    // Phone input step
    if (step === 'phone') {
        return (
            <form onSubmit={handleSendOtp} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                            disabled={isLoading}
                            className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        We&apos;ll send you a 6-digit OTP
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending OTP...
                        </>
                    ) : (
                        'Send OTP'
                    )}
                </Button>
            </form>
        );
    }

    // OTP verification step
    return (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
            <button
                type="button"
                onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError(null);
                }}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#31CDD4] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Change phone number
            </button>

            {
                error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )
            }

            <div className="p-4 bg-[#31CDD4]/10 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    OTP sent to:
                </p>
                <p className="font-semibold text-[#0B1F51] dark:text-white">
                    {phone}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter OTP
                </Label>
                <Input
                    ref={otpInputRef}
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    required
                    disabled={isLoading}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border-gray-200 dark:border-gray-700"
                />
            </div>

            <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 bg-[#0B1F51] hover:bg-[#31CDD4] text-white rounded-xl font-semibold text-base transition-all duration-300"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Verify & Login
                    </>
                )}
            </Button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#31CDD4] transition-colors disabled:opacity-50"
                >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
            </div>
        </form >
    );
}
