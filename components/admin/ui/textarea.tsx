import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-16 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00A9FE] focus:ring-1 focus:ring-[#00A9FE] disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
