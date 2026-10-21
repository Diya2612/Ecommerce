'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
    const { signOut, isLoading } = useAuth();

    return (
        <Button
            variant="outline"
            onClick={() => signOut()}
            disabled={isLoading}
            className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                </>
            ) : (
                <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                </>
            )}
        </Button>
    );
}
