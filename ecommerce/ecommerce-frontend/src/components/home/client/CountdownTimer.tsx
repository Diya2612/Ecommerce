'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    targetDate: Date;
}

/**
 * CountdownTimer - Client Component
 * 
 * Real-time countdown timer that updates every second
 * Maintains EXACT same UI as original CountdownStrip component
 */
export function CountdownTimer({ targetDate }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

    function calculateTimeLeft() {
        const difference = +targetDate - +new Date();
        let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        // Initial update
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    // Default values for server/initial render
    const displayTime = timeLeft || { hours: 0, minutes: 0, seconds: 0 };

    return (
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            <div className="flex items-center gap-2 text-white/90 font-mono font-medium text-sm">
                <span className="bg-white/10 rounded px-1.5 py-0.5">{String(displayTime.hours).padStart(2, '0')}</span>
                <span className="text-white/40">:</span>
                <span className="bg-white/10 rounded px-1.5 py-0.5">{String(displayTime.minutes).padStart(2, '0')}</span>
                <span className="text-white/40">:</span>
                <span className="bg-white/10 rounded px-1.5 py-0.5">{String(displayTime.seconds).padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#00C4CC] font-bold ml-1">Expires Soon</span>
        </div>
    );
}
