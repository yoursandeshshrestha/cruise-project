import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
}: TimePickerProps) {
  // Convert 24-hour format to 12-hour format with AM/PM
  const convert24To12 = (time24: string) => {
    const [h, m] = time24.split(':');
    const hour24 = parseInt(h, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: m || '00',
      period,
    };
  };

  // Convert 12-hour format with AM/PM to 24-hour format
  const convert12To24 = (hour12: string, minute: string, period: string) => {
    let hour24 = parseInt(hour12, 10);
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const initial = value ? convert24To12(value) : { hour: '09', minute: '00', period: 'AM' };

  const [open, setOpen] = React.useState(false);
  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [period, setPeriod] = React.useState(initial.period);

  const hourRef = React.useRef<HTMLDivElement>(null);
  const minuteRef = React.useRef<HTMLDivElement>(null);
  const periodRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value) {
      const converted = convert24To12(value);
      setHour(converted.hour);
      setMinute(converted.minute);
      setPeriod(converted.period);
    }
  }, [value]);

  React.useEffect(() => {
    if (open && hourRef.current && minuteRef.current && periodRef.current) {
      // Scroll to selected hour, minute, and period when popover opens
      const hourIndex = parseInt(hour, 10) - 1;
      const minuteIndex = parseInt(minute, 10);
      const periodIndex = period === 'AM' ? 0 : 1;

      const hourItem = hourRef.current.children[hourIndex] as HTMLElement;
      const minuteItem = minuteRef.current.children[minuteIndex] as HTMLElement;
      const periodItem = periodRef.current.children[periodIndex] as HTMLElement;

      if (hourItem) {
        hourRef.current.scrollTop = hourItem.offsetTop - hourRef.current.offsetHeight / 2 + hourItem.offsetHeight / 2;
      }
      if (minuteItem) {
        minuteRef.current.scrollTop = minuteItem.offsetTop - minuteRef.current.offsetHeight / 2 + minuteItem.offsetHeight / 2;
      }
      if (periodItem) {
        periodRef.current.scrollTop = periodItem.offsetTop - periodRef.current.offsetHeight / 2 + periodItem.offsetHeight / 2;
      }
    }
  }, [open, hour, minute, period]);

  const handleApply = () => {
    const timeString = convert12To24(hour, minute, period);
    onChange?.(timeString);
    setOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
            "flex items-center justify-start text-left",
            "focus:outline-none focus:border-[#00A9FE] focus:ring-1 focus:ring-[#00A9FE]",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer",
            !value && "text-slate-400",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-slate-500" />
          {value ? (() => {
            const { hour: h12, minute: m, period: p } = convert24To12(value);
            return `${h12}:${m} ${p}`;
          })() : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-slate-200" align="start">
        <div className="p-4">
          <div className="flex gap-2 items-center">
            {/* Hours Column */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-slate-600 mb-2 text-center">Hour</div>
              <div
                ref={hourRef}
                className="h-[180px] w-16 overflow-y-auto border border-slate-200 rounded-md scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour(h)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-center hover:bg-slate-100 cursor-pointer transition-colors",
                      hour === h && "bg-[#00A9FE] text-white font-medium hover:bg-[#00A9FE]"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="text-2xl font-semibold text-slate-400 pt-6">:</div>

            {/* Minutes Column */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-slate-600 mb-2 text-center">Minute</div>
              <div
                ref={minuteRef}
                className="h-[180px] w-16 overflow-y-auto border border-slate-200 rounded-md scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-center hover:bg-slate-100 cursor-pointer transition-colors",
                      minute === m && "bg-[#00A9FE] text-white font-medium hover:bg-[#00A9FE]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-slate-600 mb-2 text-center">Period</div>
              <div
                ref={periodRef}
                className="h-[180px] w-16 overflow-y-auto border border-slate-200 rounded-md scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {periods.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-center hover:bg-slate-100 cursor-pointer transition-colors",
                      period === p && "bg-[#00A9FE] text-white font-medium hover:bg-[#00A9FE]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-sm rounded-md bg-[#00A9FE] text-white hover:bg-[#0090d9] cursor-pointer transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
