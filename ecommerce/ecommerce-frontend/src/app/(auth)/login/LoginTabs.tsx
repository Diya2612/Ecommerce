'use client';

import { useState } from 'react';
import { LoginForm, PhoneLoginForm } from '@/components/auth';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'email' | 'phone';

export function LoginTabs() {
    const [activeTab, setActiveTab] = useState<Tab>('email');

    return (
        <div>
            {/* Tab buttons */}
            <div className="flex gap-2 p-1 mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <button
                    type="button"
                    onClick={() => setActiveTab('email')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === 'email'
                            ? "bg-white dark:bg-slate-700 text-[#0B1F51] dark:text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-[#0B1F51] dark:hover:text-white"
                    )}
                >
                    <Mail className="w-4 h-4" />
                    Email
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('phone')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === 'phone'
                            ? "bg-white dark:bg-slate-700 text-[#0B1F51] dark:text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-[#0B1F51] dark:hover:text-white"
                    )}
                >
                    <Phone className="w-4 h-4" />
                    Phone
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'email' ? <LoginForm /> : <PhoneLoginForm />}
        </div>
    );
}
