import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect: (date: Date) => void
  minDate?: Date
  disabled?: boolean
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function Calendar({ selected, onSelect, minDate, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date()
  )

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isDisabled = (date: Date) => {
    if (disabled) return true
    if (minDate) {
      const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      const check = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      return check < min
    }
    return false
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (!isDisabled(date)) {
      onSelect(date)
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = []

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add all days in the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="w-[280px] p-3 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          disabled={disabled}
        >
          <ChevronLeft size={20} className="text-[#001848]" />
        </button>
        <div className="text-sm font-semibold text-[#001848]">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          disabled={disabled}
        >
          <ChevronRight size={20} className="text-[#001848]" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const isSelectedDay = selected ? isSameDay(date, selected) : false
          const isTodayDay = isToday(date)
          const isDisabledDay = isDisabled(date)

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isDisabledDay}
              className={cn(
                "h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors cursor-pointer",
                isSelectedDay && "bg-[#00A9FE] text-white font-semibold hover:bg-[#0095E5]",
                !isSelectedDay && !isDisabledDay && "hover:bg-gray-100 text-[#001848]",
                !isSelectedDay && isTodayDay && "font-semibold text-[#00A9FE]",
                isDisabledDay && "text-gray-300 cursor-not-allowed opacity-40"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
