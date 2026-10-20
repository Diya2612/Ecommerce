import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabase } from "@/lib/supabase";
import { setLoggedInUser } from "@/utils/auth";
import { notifySuccess, notifyError } from "@/utils";
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas';
import { ROUTES } from '@/lib/constants';

import { FormButton } from "@/components/forms/FormButton";
import logo from "@/assets/logos/ANANT ENTERPRISES 1-04.png";

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);


    // MFA State
    const [needsMfa, setNeedsMfa] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
    const [mfaCode, setMfaCode] = useState('');
    const [isMfaVerifying, setIsMfaVerifying] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // -------------------------
    // Helper: Finalize Login
    // -------------------------
    const finalizeLogin = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) throw new Error('Session not found during finalization');

            // Sync user to backend database
            try {
                const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/auth/sync-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        name: `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`.trim() || session.user.email?.split('@')[0],
                    }),
                });

                if (!response.ok) {
                    console.warn('User sync failed with status:', response.status);
                }
            } catch (syncError) {
                console.error('User sync failed:', syncError);
            }

            // Store user data locally
            const user = {
                id: session.user.id,
                email: session.user.email || '',
                name: `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`.trim() || session.user.email || '',
                role: 'user',
                permissions: [],
            };
            setLoggedInUser(user);

            notifySuccess("Login successful!");
            navigate(ROUTES.DASHBOARD, { replace: true });

        } catch (error: any) {
            notifyError(error.message || "Failed to finalize login");
        }
    };



    // -------------------------
    // MFA Verify Handler
    // -------------------------
    const handleVerifyMfa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaFactorId || mfaCode.length !== 6) {
            notifyError("Please enter a valid 6-digit code");
            return;
        }

        setIsMfaVerifying(true);
        try {
            // 1. Challenge
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: mfaFactorId
            });
            if (challengeError) throw challengeError;

            // 2. Verify
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challengeData.id,
                code: mfaCode
            });
            if (verifyError) throw verifyError;

            // Success - session is upgraded automatically by verify call if using client lib?
            // Wait, supabase-js docs say verify returns session data and sets it.
            // Let's ensure session is refreshed
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) console.warn("Session refresh warning:", refreshError);

            await finalizeLogin();

        } catch (error: any) {
            console.error("MFA Verify Error:", error);
            notifyError(error.message || "2FA Verification Failed");
            setIsMfaVerifying(false);
        }
    };

    // -------------------------
    // Submit Handler (Password)
    // -------------------------
    const handleSubmitForm = async (values: LoginFormData) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) throw error;
            if (!data.session) throw new Error("No session created");

            // Check MFA Requirement
            const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aalError) console.warn("AAL check failed:", aalError);

            // If nextLevel is 'aal2', user has MFA enabled and can upgrade
            if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
                // Fetch factors to find the TOTP factor ID
                const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;

                const totpFactor = factorsData.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

                if (totpFactor) {
                    setMfaFactorId(totpFactor.id);
                    setNeedsMfa(true);
                    notifySuccess("Please enter 2FA code");
                    return; // Stop here, wait for MFA
                }
            }

            // No MFA needed, proceed
            await finalizeLogin();

        } catch (error) {
            let message = "Invalid email or password";
            if (error instanceof Error) message = error.message;
            notifyError(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0E042F] via-[#1a0f3e] to-[#0E042F] p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-0">
                        <img
                            src={logo}
                            alt="Anant Enterprises Logo"
                            className="w-36 h-36 object-contain"
                        />
                    </div>
                    <h1 className="text-white text-3xl mb-2">
                        {needsMfa ? "Two-Factor Authentication" : "Welcome Back"}
                    </h1>
                    <p className="text-white/60">
                        {needsMfa ? "Enter the code from your authenticator app" : "Sign in to continue to your account"}
                    </p>
                </div>

                {/* Login/MFA Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {needsMfa ? (
                        // MFA Form
                        <form onSubmit={handleVerifyMfa} className="space-y-6">
                            <div>
                                <label className="block text-sm mb-2 text-gray-700">Authentication Code</label>
                                <div className="relative">
                                    <ShieldCheck
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E042F] text-center tracking-widest text-lg font-mono"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <FormButton isLoading={isMfaVerifying}>
                                Verify & Sign In
                            </FormButton>

                            <button
                                type="button"
                                onClick={() => setNeedsMfa(false)}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        // Standard Login Form
                        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm mb-2 text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E042F]"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm mb-2 text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register('password')}
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E042F]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <FormButton isLoading={isSubmitting}>
                                Login
                            </FormButton>
                        </form>
                    )}

                    {!needsMfa && (
                        <>
                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                {/* <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                </div> */}
                            </div>

                            {/* Social Login Options */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={isGoogleLoading || isSubmitting}
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                > */}
                                {/* Google SVG */}
                                {/* {isGoogleLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4285F4] rounded-full animate-spin" />
                                            <span className="text-sm text-gray-700">Connecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-sm text-gray-700">Google</span>
                                        </>
                                    )}
                                </button> */}
                                {/* <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">Facebook</span>
                                </button> */}
                            </div>


                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;