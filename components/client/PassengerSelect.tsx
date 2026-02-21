import * as React from "react"
import { Users, Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/client/ui/popover"

interface PassengerSelectProps {
  label?: string
  placeholder?: string
  value: number
  onChange: (count: number) => void
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  required?: boolean
}

export function PassengerSelect({
  label,
  placeholder = "Select passengers",
  value,
  onChange,
  disabled,
  className,
  min = 1,
  max = 15,
  required = false,
}: PassengerSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleQuickSelect = (count: number) => {
    onChange(count)
    setOpen(false)
  }

  const quickNumbers = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-bold text-[#001848] flex items-center gap-2 cursor-pointer">
          <Users size={16} className="text-[#00A9FE]" />
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
            <Users size={16} className="mr-2 text-gray-500" />
            {value ? (
              <span className="text-[#001848]">
                {value} {value === 1 ? "Passenger" : "Passengers"}
              </span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <div className="p-4 bg-white rounded-lg">
            {/* Counter */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm font-semibold text-[#001848]">Number of Passengers</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={value <= min}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-[#00A9FE] flex items-center justify-center transition-colors cursor-pointer",
                    value <= min
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[#00A9FE] hover:text-white text-[#00A9FE]"
                  )}
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold text-[#001848] w-8 text-center">
                  {value}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={value >= max}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-[#00A9FE] flex items-center justify-center transition-colors cursor-pointer",
                    value >= max
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[#00A9FE] hover:text-white text-[#00A9FE]"
                  )}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Quick Select */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick Select</p>
              <div className="grid grid-cols-4 gap-2">
                {quickNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickSelect(num)}
                    className={cn(
                      "py-2 px-3 text-sm rounded-md transition-colors cursor-pointer",
                      value === num
                        ? "bg-[#00A9FE] text-white font-semibold"
                        : "bg-gray-100 hover:bg-gray-200 text-[#001848]"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
