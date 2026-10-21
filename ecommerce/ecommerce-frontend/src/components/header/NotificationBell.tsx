'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationSocket } from '@/contexts/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useState } from 'react';

export function NotificationBell() {
    const { unreadCount } = useNotificationSocket();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#1C2A54] dark:text-white hover:text-[#31CDD4] hover:bg-[#31CDD4]/10 dark:hover:bg-slate-800 rounded-full w-10 h-10 transition-colors relative"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[11px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen sm:w-[420px] p-0" align="end">
                <NotificationDropdown onClose={() => setIsOpen(false)} />
            </PopoverContent>
        </Popover>
    );
}
