"use client"

import * as React from "react"
import { useState, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { setMonth, setYear, startOfMonth, getMonth, getYear } from "date-fns"

import { cn } from "@/lib/utils/cn"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    /**
     * The earliest year to show in the year selector
     * @default 1900
     */
    fromYear?: number
    /**
     * The latest year to show in the year selector
     * @default current year + 10
     */
    toYear?: number
}

// Month names for dropdown
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    fromYear = 1900,
    toYear = new Date().getFullYear() + 10,
    defaultMonth,
    month: controlledMonth,
    onMonthChange,
    ...props
}: CalendarProps) {
    // Internal state for month navigation
    const [internalMonth, setInternalMonth] = useState<Date>(
        controlledMonth || defaultMonth || new Date()
    )

    // Use controlled or internal month
    const currentMonth = controlledMonth || internalMonth

    // Generate year options
    const years = useMemo(() => {
        const yearArray: number[] = []
        for (let year = toYear; year >= fromYear; year--) {
            yearArray.push(year)
        }
        return yearArray
    }, [fromYear, toYear])

    // Handle month/year changes
    const handleMonthChange = useCallback((newMonth: Date) => {
        setInternalMonth(newMonth)
        onMonthChange?.(newMonth)
    }, [onMonthChange])

    const handleMonthSelect = useCallback((monthStr: string) => {
        const monthIndex = parseInt(monthStr, 10)
        const newDate = setMonth(currentMonth, monthIndex)
        handleMonthChange(newDate)
    }, [currentMonth, handleMonthChange])

    const handleYearSelect = useCallback((yearStr: string) => {
        const year = parseInt(yearStr, 10)
        const newDate = setYear(currentMonth, year)
        handleMonthChange(newDate)
    }, [currentMonth, handleMonthChange])

    const handlePreviousMonth = useCallback(() => {
        const newDate = new Date(currentMonth)
        newDate.setMonth(newDate.getMonth() - 1)
        handleMonthChange(startOfMonth(newDate))
    }, [currentMonth, handleMonthChange])

    const handleNextMonth = useCallback(() => {
        const newDate = new Date(currentMonth)
        newDate.setMonth(newDate.getMonth() + 1)
        handleMonthChange(startOfMonth(newDate))
    }, [currentMonth, handleMonthChange])

    return (
        <div
            className={cn(
                "p-5 bg-white dark:bg-slate-900 rounded-2xl",
                "shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50",
                "border border-gray-100 dark:border-slate-800",
                "min-w-[320px]",
                className
            )}
        >
            {/* Custom Header with Month/Year Selectors */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                {/* Previous Month Button */}
                <button
                    type="button"
                    onClick={handlePreviousMonth}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0",
                        "bg-gray-50 dark:bg-slate-800",
                        "hover:bg-[#00C4CC]/15 dark:hover:bg-[#00C4CC]/20",
                        "text-gray-500 dark:text-gray-400 hover:text-[#00C4CC]",
                        "border border-gray-200 dark:border-slate-700",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/40"
                    )}
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Month and Year Dropdowns */}
                <div className="flex items-center gap-3 flex-1 justify-center">
                    {/* Month Selector */}
                    <Select
                        value={getMonth(currentMonth).toString()}
                        onValueChange={handleMonthSelect}
                    >
                        <SelectTrigger
                            className={cn(
                                "w-[130px] h-9 px-3 text-sm font-semibold rounded-xl",
                                "border-gray-200 dark:border-slate-700",
                                "bg-gray-50 dark:bg-slate-800",
                                "text-gray-700 dark:text-gray-200",
                                "hover:bg-[#00C4CC]/10 dark:hover:bg-[#00C4CC]/20",
                                "hover:border-[#00C4CC]/50 dark:hover:border-[#00C4CC]/50",
                                "focus:ring-2 focus:ring-[#00C4CC]/40 focus:border-[#00C4CC]",
                                "transition-all duration-200"
                            )}
                        >
                            <SelectValue>{MONTHS[getMonth(currentMonth)]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] rounded-xl z-[250]">
                            {MONTHS.map((month, index) => (
                                <SelectItem
                                    key={month}
                                    value={index.toString()}
                                    className="cursor-pointer rounded-lg hover:bg-[#00C4CC]/10 focus:bg-[#00C4CC]/10"
                                >
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year Selector */}
                    <Select
                        value={getYear(currentMonth).toString()}
                        onValueChange={handleYearSelect}
                    >
                        <SelectTrigger
                            className={cn(
                                "w-[100px] h-9 px-3 text-sm font-semibold rounded-xl",
                                "border-gray-200 dark:border-slate-700",
                                "bg-gray-50 dark:bg-slate-800",
                                "text-gray-700 dark:text-gray-200",
                                "hover:bg-[#00C4CC]/10 dark:hover:bg-[#00C4CC]/20",
                                "hover:border-[#00C4CC]/50 dark:hover:border-[#00C4CC]/50",
                                "focus:ring-2 focus:ring-[#00C4CC]/40 focus:border-[#00C4CC]",
                                "transition-all duration-200"
                            )}
                        >
                            <SelectValue>{getYear(currentMonth)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] rounded-xl z-[250]">
                            {years.map((year) => (
                                <SelectItem
                                    key={year}
                                    value={year.toString()}
                                    className="cursor-pointer rounded-lg hover:bg-[#00C4CC]/10 focus:bg-[#00C4CC]/10"
                                >
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Next Month Button */}
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0",
                        "bg-gray-50 dark:bg-slate-800",
                        "hover:bg-[#00C4CC]/15 dark:hover:bg-[#00C4CC]/20",
                        "text-gray-500 dark:text-gray-400 hover:text-[#00C4CC]",
                        "border border-gray-200 dark:border-slate-700",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/40"
                    )}
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Day Picker Grid */}
            <DayPicker
                showOutsideDays={showOutsideDays}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                hideNavigation
                classNames={{
                    months: "flex flex-col",
                    month: "space-y-3",
                    month_caption: "hidden",
                    caption_label: "hidden",
                    nav: "hidden",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex gap-1 mb-2",
                    weekday: cn(
                        "text-gray-400 dark:text-gray-500 font-semibold text-xs uppercase tracking-wider",
                        "w-10 h-10 flex items-center justify-center"
                    ),
                    week: "flex gap-1 mt-1",
                    day: cn(
                        "w-10 h-10 text-center text-sm p-0",
                        "relative flex items-center justify-center"
                    ),
                    day_button: cn(
                        "w-9 h-9 p-0 font-medium rounded-xl",
                        "text-gray-700 dark:text-gray-200",
                        "hover:bg-[#00C4CC]/15 hover:text-[#00C4CC]",
                        "focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/40",
                        "transition-all duration-150 cursor-pointer",
                        // Selected state - overrides default colors
                        "[&[data-selected='true']]:bg-[#0B1F51] [&[data-selected='true']]:text-white",
                        "[&[data-selected='true']]:hover:bg-[#00C4CC] [&[data-selected='true']]:hover:text-white",
                        "[&[data-selected='true']]:shadow-lg [&[data-selected='true']]:shadow-[#0B1F51]/30",
                        "[&[data-selected='true']]:font-semibold",
                        // Today state - subtle highlight
                        "[&[data-today='true']]:ring-2 [&[data-today='true']]:ring-[#00C4CC]/50",
                        "[&[data-today='true']]:font-bold [&[data-today='true']]:text-[#0B1F51]",
                        // Selected + Today combined
                        "[&[data-selected='true'][data-today='true']]:ring-0"
                    ),
                    range_end: "day-range-end",
                    selected: "",
                    today: "",
                    outside: cn(
                        "!text-gray-300 dark:!text-gray-600",
                        "aria-selected:!bg-accent/50 aria-selected:!text-muted-foreground"
                    ),
                    disabled: "!text-gray-300 dark:!text-gray-600 cursor-not-allowed opacity-50",
                    range_middle: "aria-selected:!bg-[#00C4CC]/10 aria-selected:!text-[#0B1F51]",
                    hidden: "invisible",
                    ...classNames,
                }}
                {...props}
            />
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
