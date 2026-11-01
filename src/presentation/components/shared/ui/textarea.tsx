import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-slate-200 flex min-h-20 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-sm shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-[#7C3AED]/40 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]/10 focus-visible:ring-[4px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
