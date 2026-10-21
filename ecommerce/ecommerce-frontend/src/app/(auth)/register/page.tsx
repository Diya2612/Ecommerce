import { Suspense } from 'react';
import { RegisterForm, GoogleAuthButton, RegisterFormSkeleton, GoogleAuthButtonSkeleton } from '@/components/auth';

export const metadata = {
    title: 'Create Account | Anant Enterprises',
    description: 'Create a new Anant Enterprises account',
};

export default function RegisterPage() {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1F51] dark:text-white mb-2">
                    Create Account
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Join us for exclusive deals and seamless shopping
                </p>
            </div>

            <Suspense fallback={<RegisterFormSkeleton />}>
                <RegisterForm />
            </Suspense>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">
                        or sign up with
                    </span>
                </div>
            </div>

            {/* Social Signup */}
            <Suspense fallback={<GoogleAuthButtonSkeleton />}>
                <GoogleAuthButton variant="register" />
            </Suspense>
        </div>
    );
}
