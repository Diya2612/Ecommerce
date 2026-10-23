import { Suspense } from 'react';
import {
    LoginForm,
    GoogleAuthButton,
    LoginTabsSkeleton,
    LoginFormSkeleton,
    GoogleAuthButtonSkeleton
} from '@/components/auth';
import { FEATURES } from '@/config/features';
import { LoginTabs } from './LoginTabs';

export const metadata = {
    title: 'Login | Ecommerce Store',
    description: 'Sign in to your Ecommerce account',
};

export default function LoginPage() {
    // Check feature flags
    const showPhoneLogin = FEATURES.PHONE_LOGIN;
    const showGoogleLogin = FEATURES.GOOGLE_LOGIN;

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1F51] dark:text-white mb-2">
                    Welcome Back
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Sign in to access your account and orders
                </p>
            </div>

            <Suspense
                fallback={
                    showPhoneLogin ? <LoginTabsSkeleton /> : <LoginFormSkeleton />
                }
            >
                {/* Show tabs if phone login is enabled */}
                {showPhoneLogin ? (
                    <LoginTabs />
                ) : (
                    <LoginForm />
                )}
            </Suspense>

            {/* Divider - only show if Google login is enabled */}
            {showGoogleLogin && (
                <>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <Suspense fallback={<GoogleAuthButtonSkeleton />}>
                        <GoogleAuthButton variant="login" />
                    </Suspense>
                </>
            )}
        </div>
    );
}
