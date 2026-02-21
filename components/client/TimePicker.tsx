import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/client/ui/popover"

interface TimePickerProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (time: string) => void
  disabled?: boolean
  className?: string
  timeSlots?: string[]
  required?: boolean
}

const DEFAULT_TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

// Convert 24-hour format to 12-hour format with AM/PM
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function TimePicker({
  label,
  placeholder = "Select time",
  value,
  onChange,
  disabled,
  className,
  timeSlots = DEFAULT_TIME_SLOTS,
  required = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (time: string) => {
    onChange(time)
    setOpen(false)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-bold text-[#001848] flex items-center gap-2 cursor-pointer">
          <Clock size={16} className="text-[#00A9FE]" />
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A9FE] focus:border-[#00A9FE] transition-all bg-white text-left flex items-center cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
              !value && "text-gray-400"
            )}
          >
            <Clock size={16} className="mr-2 text-gray-500" />
            {value ? (
              <span className="text-[#001848]">{formatTime12Hour(value)}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="max-h-[280px] overflow-y-auto p-2 bg-white rounded-lg">
            <div className="flex flex-col gap-1">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleSelect(time)}
                  className={cn(
                    "px-4 py-2.5 text-sm rounded-md transition-colors cursor-pointer text-left",
                    value === time
                      ? "bg-[#00A9FE] text-white font-semibold"
                      : "hover:bg-gray-100 text-[#001848]"
                  )}
                >
                  {formatTime12Hour(time)}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
