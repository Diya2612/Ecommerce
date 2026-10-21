'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { TimeSlot } from '@/types/contact';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    timeSlots: TimeSlot[];
}

/**
 * DateTimePicker - Client Component
 * 
 * Handles date and time slot selection with form state using premium Calendar component.
 */
export function DateTimePicker({ timeSlots }: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-[#F9FBFD] to-white border border-black/6 rounded-[28px] p-8 md:p-12"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#00C4CC] rounded-full flex items-center justify-center text-white font-bold">
                    2
                </div>
                <h3 className="text-[28px] font-semibold text-[#0B1F51] tracking-[-0.01em]">
                    Choose Date & Time
                </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <div>
                    <label
                        className="flex items-center gap-2 text-[16px] font-semibold text-[#0B1F51] mb-4"
                    >
                        <CalendarIcon className="w-5 h-5 text-[#00C4CC]" aria-hidden="true" />
                        Select Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full h-14 px-6 rounded-input border-2 justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground",
                                    "border-gray-200 hover:border-[#00C4CC] hover:bg-transparent hover:text-inherit",
                                    "focus:border-[#00C4CC] focus:ring-2 focus:ring-[#00C4CC]/20",
                                    "transition-all duration-200"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-5 w-5 text-[#00C4CC]" />
                                {selectedDate ? (
                                    format(selectedDate, "PPP")
                                ) : (
                                    <span className="text-gray-500">Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-0 shadow-none bg-transparent" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 1}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Time Slots */}
                <div>
                    <label className="flex items-center gap-2 text-[16px] font-semibold text-[#0B1F51] mb-4">
                        <Clock className="w-5 h-5 text-[#00C4CC]" aria-hidden="true" />
                        Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-3" role="group" aria-label="Available time slots">
                        {timeSlots.map((slot) => (
                            <motion.button
                                key={slot.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedTimeSlot(slot.id)}
                                className={`h-12 px-4 rounded-input border-2 transition-all font-medium text-[14px] ${selectedTimeSlot === slot.id
                                        ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#0B1F51]'
                                        : 'border-gray-200 hover:border-[#00C4CC] hover:bg-[#00C4CC]/5 text-gray-700'
                                    }`}
                                aria-pressed={selectedTimeSlot === slot.id}
                            >
                                {slot.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Emergency Service Notice */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-[#F5B012]/10 border border-[#F5B012]/30 rounded-input p-6"
                role="note"
            >
                <p className="text-[16px] text-gray-700 leading-[150%]">
                    <span className="font-bold text-[#0B1F51]">Need urgent service?</span> Call our 24/7 emergency helpline at{' '}
                    <a
                        href="tel:1800-XXX-XXXX"
                        className="text-[#00C4CC] font-bold hover:underline"
                    >
                        1800-XXX-XXXX
                    </a>
                </p>
            </motion.div>
        </motion.div>
    );
}
