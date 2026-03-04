import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DATE_FORMAT } from "@/lib/dateUtils"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/client/ui/popover"
import { Calendar } from "./Calendar"

interface DatePickerProps {
  label?: string
  placeholder?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: boolean
  minDate?: Date
  className?: string
  required?: boolean
}

export function DatePicker({
  label,
  placeholder = "Pick a date",
  value,
  onChange,
  disabled,
  minDate,
  className,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date) => {
    onChange(date)
    setOpen(false)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-bold text-[#001848] flex items-center gap-2 cursor-pointer">
          <CalendarIcon size={16} className="text-[#00A9FE]" />
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
            <CalendarIcon size={16} className="mr-2 text-gray-500" />
            {value ? (
              <span className="text-[#001848]">{format(value, DATE_FORMAT)}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            selected={value}
            onSelect={handleSelect}
            minDate={minDate}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
