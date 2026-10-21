'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/utils';

export function UserMenu() {
    const { user } = useAuth();
    const pathname = usePathname();

    const isProfileActive = pathname === '/profile' || pathname?.startsWith('/profile/');
    const href = user ? '/profile/orders' : '/register';
    const label = user ? 'Go to profile' : 'Sign up';

    return (
        <Link href={href}>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "hover:bg-[#31CDD4]/10 rounded-full w-10 h-10 p-0",
                    isProfileActive && "bg-[#31CDD4]/10"
                )}
                aria-label={label}
            >
                {user ? (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#31CDD4] to-[#0B1F51] flex items-center justify-center text-white font-semibold text-sm">
                        {(user.user_metadata?.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </div>
                ) : (
                    // <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[#1C2A54] dark:text-gray-300 group-hover:text-[#31CDD4] transition-colors">
                    <User className="w-5 h-5" />
                    // </div> 
                )}
            </Button>
        </Link>
    );
}
