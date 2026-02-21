import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DayPicker, type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/client/ui/popover"

interface DateRangePickerProps {
  label?: string
  placeholder?: string
  value: { from: Date | undefined; to: Date | undefined }
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  disabled?: boolean
  minDate?: Date
  className?: string
}

export function DateRangePicker({
  label,
  placeholder = "Pick a date",
  value,
  onChange,
  disabled,
  minDate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from,
      to: range?.to,
    })
    // Close popover when both dates are selected
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-bold text-[#001848] flex items-center gap-2 cursor-pointer">
          <CalendarIcon size={16} className="text-[#00A9FE]" />
          {label}
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
              !value.from && "text-gray-400"
            )}
          >
            <CalendarIcon size={16} className="mr-2 text-gray-500" />
            {value?.from ? (
              value.to ? (
                <span className="text-[#001848]">
                  {format(value.from, "MMM dd, yyyy")} - {format(value.to, "MMM dd, yyyy")}
                </span>
              ) : (
                <span className="text-[#001848]">{format(value.from, "MMM dd, yyyy")}</span>
              )
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="range"
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={minDate ? { before: minDate } : undefined}
            className="p-3"
            classNames={{
              root: "rdp",
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              month_caption: "flex justify-center pt-1 relative items-center h-7",
              caption_label: "text-sm font-medium text-[#001848]",
              nav: "flex items-center",
              button_previous: "absolute left-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              button_next: "absolute right-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              month_grid: "w-full border-collapse mt-4",
              weekdays: "flex",
              weekday: "text-gray-500 rounded-md w-9 font-normal text-xs",
              week: "flex w-full mt-2",
              day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day_button: "inline-flex items-center justify-center rounded-md text-sm h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              selected: "bg-[#00A9FE] text-white hover:bg-[#00A9FE] hover:text-white focus:bg-[#00A9FE] focus:text-white",
              range_start: "day-range-start",
              range_end: "day-range-end",
              range_middle: "aria-selected:bg-blue-50 aria-selected:text-[#001848]",
              today: "bg-gray-100 text-[#001848]",
              outside: "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500",
              disabled: "text-gray-400 opacity-50",
              hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
