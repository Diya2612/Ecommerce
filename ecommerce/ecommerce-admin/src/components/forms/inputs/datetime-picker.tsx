import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DateTimePickerProps {
    value?: Date
    onChange: (date?: Date) => void
    placeholder?: string
    className?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date and time", className }: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        setSelectedDate(value)
    }, [value, open])

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            setSelectedDate(undefined)
            return
        }
        const newDate = new Date(date)
        // Preserve time from current selection or default to 09:00
        if (selectedDate) {
            newDate.setHours(selectedDate.getHours())
            newDate.setMinutes(selectedDate.getMinutes())
        } else {
            newDate.setHours(9)
            newDate.setMinutes(0)
        }
        setSelectedDate(newDate)
    }

    const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
        if (!selectedDate) return
        const newDate = new Date(selectedDate)
        if (type === 'hour') {
            newDate.setHours(parseInt(val))
        } else {
            newDate.setMinutes(parseInt(val))
        }
        setSelectedDate(newDate)
    }

    const handleApply = () => {
        onChange(selectedDate)
        setOpen(false)
    }

    const handleClear = () => {
        onChange(undefined)
        setOpen(false)
    }

    const handleToday = () => {
        const now = new Date()
        onChange(now)
        setOpen(false)
    }

    // Generate hours 0-23
    const hours = Array.from({ length: 24 }, (_, i) => i)
    // Generate minutes in 5-minute intervals
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal border-slate-200 shadow-sm",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP HH:mm") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {/* Calendar */}
                    <div className="p-3">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                    </div>

                    {/* Time Picker */}
                    <div className="p-4 flex flex-col justify-between min-w-[200px] bg-slate-50/50">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Clock className="h-4 w-4" /> Time
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Hour</span>
                                    <Select
                                        value={selectedDate ? selectedDate.getHours().toString() : "9"}
                                        onValueChange={(v) => handleTimeChange('hour', v)}
                                        disabled={!selectedDate}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="HH" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="h-[200px]">
                                            {hours.map(h => (
                                                <SelectItem key={h} value={h.toString()}>
                                                    {h.toString().padStart(2, '0')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Minute</span>
                                    <Select
                                        value={selectedDate ? (Math.floor(selectedDate.getMinutes() / 5) * 5).toString() : "0"}
                                        onValueChange={(v) => handleTimeChange('minute', v)}
                                        disabled={!selectedDate}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="h-[200px]">
                                            {minutes.map(m => (
                                                <SelectItem key={m} value={m.toString()}>
                                                    {m.toString().padStart(2, '0')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <Button variant="outline" size="sm" className="w-full bg-white hover:bg-slate-50" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-red-500" onClick={handleClear}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button size="sm" className="bg-[#0f172b] hover:bg-[#1d293d]" onClick={handleApply}>Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
