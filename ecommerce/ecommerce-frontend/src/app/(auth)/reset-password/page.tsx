import { ResetPasswordForm } from '@/components/auth';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Reset Password | Anant Enterprises',
    description: 'Set a new password for your Anant Enterprises account',
};

export default function ResetPasswordPage() {
    return (
        <div>
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#31CDD4]/20 to-cyan-100 dark:from-[#31CDD4]/10 dark:to-cyan-900/20 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#31CDD4]" />
                </div>
            </div>

            <ResetPasswordForm />
        </div>
    );
}
