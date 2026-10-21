"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';

export function SignOutButton() {
    const { signOut, isLoading } = useAuth();

    return (
        <div className="p-2 border-t border-gray-100 dark:border-slate-800">
            <button
                onClick={() => signOut()}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group disabled:opacity-50"
            >
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                    ) : (
                        <LogOut className="w-5 h-5 text-red-500" />
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className="font-medium">{isLoading ? 'Signing out...' : 'Logout'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">Sign out of your account</p>
                </div>
            </button>
        </div>
    );
}
